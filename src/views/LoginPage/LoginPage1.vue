<template>
  <div class="login-page">
    <div class="head">
      <img src="@/assets/2022-09-16.png" alt="Logo" class="logo" />
      <h1 class="headline">FawnFlock</h1>
      <p class="subtitle">一个温暖的社交平台</p>
    </div>

    <div class="login-buttons">
      <button class="login-button wechat-button" disabled title="微信登录暂未开放">
        <span class="button-icon">📱</span>
        微信号登录
        <span class="coming-soon">(即将开放)</span>
      </button>
      <p class="or-text">或</p>
      <button class="login-button phone-button" @click="goToLoginPagePhoneNumber">
        <span class="button-icon">📞</span>
        手机号登录
      </button>
    </div>

    <div class="privacy-section">
      <input type="checkbox" id="agree" v-model="isAgreed" />
      <label for="agree" class="privacy-label">
        已阅读并同意
        <a href="#" class="privacy-link">《用户协议》</a>
        <a href="#" class="privacy-link">《隐私协议》</a>
        <a href="#" class="privacy-link">《儿童/青少年个人信息保护政策》</a>
      </label>
    </div>

    <!-- 提示消息 -->
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>

    <div class="dots">
      <span class="dot active"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginPage1",
  data() {
    return {
      isAgreed: false,
      errorMessage: ''
    };
  },
  methods: {
    goToLoginPagePhoneNumber() {
      // 检查是否同意协议
      if (!this.isAgreed) {
        this.errorMessage = '请先阅读并同意用户协议';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }
      
      console.log('跳转到手机号登录页');
      this.$router.push('/LoginPagePhoneNumber').catch(err => console.log(err));
    }
  },
};
</script>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.head {
  text-align: center;
  margin-bottom: 60px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.headline {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin: 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.login-buttons {
  width: 100%;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
  height: 50px;
  background-color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wechat-button {
  background: linear-gradient(135deg, #07c160 0%, #05a850 100%);
  color: white;
  margin-bottom: 15px;
}

.phone-button {
  background: white;
  color: #667eea;
}

.button-icon {
  font-size: 20px;
}

.coming-soon {
  font-size: 12px;
  opacity: 0.8;
  margin-left: 5px;
}

.or-text {
  font-size: 14px;
  color: white;
  margin: 10px 0;
  opacity: 0.8;
}

.privacy-section {
  max-width: 350px;
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
  font-size: 12px;
  color: white;
}

.privacy-section input[type="checkbox"] {
  margin-right: 8px;
  margin-top: 2px;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.privacy-label {
  flex: 1;
  line-height: 1.5;
  cursor: pointer;
}

.privacy-link {
  color: white;
  text-decoration: underline;
  margin: 0 2px;
}

.privacy-link:hover {
  opacity: 0.8;
}

.message {
  max-width: 350px;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  background-color: rgba(255, 77, 79, 0.9);
  color: white;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 40px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.dot.active {
  background-color: white;
  width: 30px;
  border-radius: 5px;
}
</style>