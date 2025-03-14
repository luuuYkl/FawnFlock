use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};

use futures_util::{FutureExt, StreamExt};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;

use salvo::prelude::*;
use salvo::websocket::{Message, WebSocket, WebSocketUpgrade};

type Users = RwLock<HashMap<usize, mpsc::UnboundedSender<Result<Message, salvo::Error>>>>;

static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);
static ONLINE_USERS: Lazy<Users> = Lazy::new(Users::default);

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WebSocketEvent {
    #[serde(rename = "ping")]
    Ping,
    #[serde(rename = "pong")]
    Pong,
    #[serde(rename = "post_update")]
    PostUpdate { post_id: String, action: String },
    #[serde(rename = "comment_update")]
    CommentUpdate {
        post_id: String,
        comment_id: String,
        action: String,
    },
    #[serde(rename = "like_update")]
    LikeUpdate {
        post_id: String,
        user_id: String,
        action: String,
    },
}

#[handler]
pub async fn user_connected(req: &mut Request, res: &mut Response) -> Result<(), StatusError> {
    WebSocketUpgrade::new()
        .upgrade(req, res, handle_socket)
        .await
}
async fn handle_socket(ws: WebSocket) {
    // Use a counter to assign a new unique ID for this user.
    let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

    tracing::info!("new chat user: {}", my_id);

    // Split the socket into a sender and receive of messages.
    let (user_ws_tx, mut user_ws_rx) = ws.split();

    // Use an unbounded channel to handle buffering and flushing of messages
    // to the websocket...
    let (tx, rx) = mpsc::unbounded_channel();
    let rx = UnboundedReceiverStream::new(rx);
    let fut = rx.forward(user_ws_tx).map(|result| {
        if let Err(e) = result {
            tracing::error!(error = ?e, "websocket send error");
        }
    });
    tokio::task::spawn(fut);
    let fut = async move {
        ONLINE_USERS.write().await.insert(my_id, tx);

        while let Some(result) = user_ws_rx.next().await {
            let msg = match result {
                Ok(msg) => msg,
                Err(e) => {
                    eprintln!("websocket error(uid={}): {}", my_id, e);
                    break;
                }
            };
            user_message(my_id, msg).await;
        }

        user_disconnected(my_id).await;
    };
    tokio::task::spawn(fut);
}
async fn user_message(my_id: usize, msg: Message) {
    let msg = if let Ok(s) = msg.as_str() {
        s
    } else {
        tracing::error!("非文本消息，已忽略");
        return;
    };

    let event: WebSocketEvent = match serde_json::from_str(msg) {
        Ok(event) => event,
        Err(e) => {
            tracing::error!(error = ?e, user_id = my_id, "消息解析失败");
            if let Some(tx) = ONLINE_USERS.read().await.get(&my_id) {
                let _ = tx.send(Ok(Message::text(
                    json!({"type": "error", "message": "消息格式错误"}).to_string(),
                )));
            }
            return;
        }
    };

    match event {
        WebSocketEvent::Ping => {
            if let Some(tx) = ONLINE_USERS.read().await.get(&my_id) {
                let _ = tx.send(Ok(Message::text(
                    serde_json::to_string(&WebSocketEvent::Pong).unwrap(),
                )));
            }
        }
        _ => {
            // Broadcast the event to all connected users
            let msg_str = serde_json::to_string(&event).unwrap();
            for (&uid, tx) in ONLINE_USERS.read().await.iter() {
                if my_id != uid {
                    if let Err(_disconnected) = tx.send(Ok(Message::text(msg_str.clone()))) {
                        // The tx is disconnected, our `user_disconnected` code
                        // should be happening in another task, nothing more to
                        // do here.
                    }
                }
            }
        }
    }
}

async fn user_disconnected(my_id: usize) {
    eprintln!("good bye user: {}", my_id);
    // Stream closed up, so remove from the user list
    ONLINE_USERS.write().await.remove(&my_id);
}
