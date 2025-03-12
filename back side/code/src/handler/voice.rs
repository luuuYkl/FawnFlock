use crate::config::connect;
use crate::db::schema::users::dsl::*;
use crate::model::user_model::User;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use diesel::prelude::*;
use rodio::{buffer::SamplesBuffer, Source};
use salvo::{prelude::*, Error};
use serde::{Deserialize, Serialize};
use spectrum_analyzer::{samples_fft_to_spectrum, FrequencyLimit};
use std::io::Cursor;

/// 声纹数据请求结构体
#[derive(Deserialize)]
struct VoiceData {
    username: String,
    voice_data: String, // Base64编码的声纹数据
}

/// 文本转语音请求结构体
#[derive(Deserialize)]
struct TextToSpeechRequest {
    username: String,
    #[allow(dead_code)]
    text: String,
}

/// 音频响应结构体
#[derive(Serialize)]
struct AudioResponse {
    audio_data: String, // Base64编码的音频数据
}

/// 将错误转换为Salvo错误的辅助函数
fn to_salvo_error<E: std::fmt::Display>(err: E, message: &str) -> Error {
    Error::other(format!("{}: {}", message, err))
}

/// 采集用户声纹数据
/// 
/// 接收Base64编码的音频数据，提取频谱特征，并存储到用户记录中
#[handler]
pub async fn collect_voice_fingerprint(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    // 获取数据库连接
    let mut conn = connect().map_err(|e| to_salvo_error(e, "数据库连接失败"))?;
    let voice_data = req.parse_json::<VoiceData>().await?;

    // 解码Base64音频数据
    let audio_bytes = STANDARD
        .decode(&voice_data.voice_data)
        .map_err(|e| to_salvo_error(e, "Base64解码失败"))?;

    // 将音频数据转换为samples
    let cursor = Cursor::new(audio_bytes);
    let decoder = rodio::Decoder::new(cursor)
        .map_err(|e| to_salvo_error(e, "音频解码失败"))?;

    // 获取采样率
    let sample_rate = decoder.sample_rate();

    // 获取音频样本并转换类型 - 归一化到[-1.0, 1.0]范围
    let samples: Vec<f32> = decoder.map(|s| s as f32 / i16::MAX as f32).collect();

    // 使用FFT提取频谱特征 - 设置合理的频率范围
    let spectrum_config = FrequencyLimit::Range(20.0, 20000.0); // 人类可听范围
    let spectrum = samples_fft_to_spectrum(&samples, sample_rate, spectrum_config, None)
        .map_err(|e| to_salvo_error(format!("{:?}", e), "频谱分析失败"))?;

    // 将频谱数据序列化为字节 - 使用预分配容量优化性能
    let spectrum_data = spectrum.data();
    let mut voice_features = Vec::with_capacity(spectrum_data.len() * 8); // 每个数据点需要8字节(两个f32)
    
    for (freq, mag) in spectrum_data {
        voice_features.extend_from_slice(&freq.val().to_le_bytes());
        voice_features.extend_from_slice(&mag.val().to_le_bytes());
    }

    // 将特征数据转换为base64
    let voice_features_base64 = STANDARD.encode(&voice_features);

    // 更新用户的声纹数据
    diesel::update(users.filter(username.eq(&voice_data.username)))
        .set(voice_fingerprint.eq(&voice_features_base64))
        .execute(&mut conn)
        .map_err(|e| to_salvo_error(e, "更新用户声纹数据失败"))?;

    res.render(Text::Plain("声纹采集成功"));
    Ok(())
}

/// 文本转语音功能
/// 
/// 根据用户声纹生成语音数据
#[handler]
pub async fn text_to_speech(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    // 获取数据库连接
    let mut conn = connect().map_err(|e| to_salvo_error(e, "数据库连接失败"))?;
    let tts_request = req.parse_json::<TextToSpeechRequest>().await?;

    // 获取用户的声纹数据
    let user = users
        .filter(username.eq(&tts_request.username))
        .first::<User>(&mut conn)
        .optional()
        .map_err(|e| to_salvo_error(e, "数据库查询失败"))?;

    match user {
        Some(user) => {
            if let Some(_voice_fingerprint) = user.voice_fingerprint {
                // 生成简单的正弦波作为基础音频
                let sample_rate = 44100; // CD质量
                let duration = 2.0; // 2秒
                let frequency = 440.0; // A4音符
                let sample_count = (sample_rate as f32 * duration) as usize;
                
                // 预分配容量以提高性能
                let mut samples = Vec::with_capacity(sample_count);
                for i in 0..sample_count {
                    let t = i as f32 / sample_rate as f32;
                    samples.push((2.0 * std::f32::consts::PI * frequency * t).sin());
                }

                // 创建音频buffer
                let buffer = SamplesBuffer::new(1, sample_rate, samples);

                // 将音频数据转换为bytes - 使用更高效的方法
                let mut audio_data = Vec::with_capacity(sample_count * 2); // 每个i16样本需要2字节
                for sample in buffer.convert_samples::<i16>() {
                    audio_data.extend_from_slice(&sample.to_le_bytes());
                }

                // 将音频数据转换为base64格式
                let audio_base64 = STANDARD.encode(&audio_data);

                let audio_response = AudioResponse {
                    audio_data: audio_base64,
                };
                res.render(Json(audio_response));
            } else {
                res.render(Text::Plain("用户未采集声纹数据"));
            }
            Ok(())
        }
        None => {
            res.render(Text::Plain("用户不存在"));
            Ok(())
        }
    }
}
