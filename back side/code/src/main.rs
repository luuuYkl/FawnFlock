mod db;
mod handler;
mod model;

use diesel::mysql::MysqlConnection;
use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use dotenv::dotenv;
use once_cell::sync::OnceCell;
use salvo::cors::Cors;
use salvo::http::Method;
use salvo::jwt_auth::{ConstDecoder, QueryFinder};
use salvo::prelude::*;
use serde::{Deserialize, Serialize};
use std::{env, vec};

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    username: String,
    exp: i64,
}

pub type DbPool = Pool<ConnectionManager<MysqlConnection>>;

static DB_POOL: OnceCell<DbPool> = OnceCell::new();

pub fn connect() -> Result<PooledConnection<ConnectionManager<MysqlConnection>>, PoolError> {
    DB_POOL.get().unwrap().get()
}
fn build_pool(database_url: &str, size: u32) -> Result<DbPool, PoolError> {
    let manager = ConnectionManager::<MysqlConnection>::new(database_url);
    diesel::r2d2::Pool::builder()
        .max_size(size)
        .min_idle(Some(size))
        .test_on_check_out(false)
        .idle_timeout(None)
        .max_lifetime(None)
        .build(manager)
}

#[tokio::main]
async fn main() {
    // 载入.env文件中的环境变量
    dotenv().ok();

    // 从环境变量获取数据库的连接字符串
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    DB_POOL
        .set(
            build_pool(&database_url, 10).expect(&format!("Error connecting to {}", &database_url)),
        )
        .ok();

    tracing_subscriber::fmt::init();

    let auth_handler: JwtAuth<JwtClaims, _> =
        JwtAuth::new(ConstDecoder::from_secret(jwt_secret.as_bytes()))
            .finders(vec![
                // Box::new(HeaderFinder::new()),
                Box::new(QueryFinder::new("jwt_token")),
                // Box::new(CookieFinder::new("jwt_token")),
            ])
            .force_passed(true);

    let cors = Cors::new()
        .allow_origin("*")
        .allow_credentials(false)
        .allow_headers(vec!["authorization", "content-type"])
        .allow_methods(vec![Method::GET, Method::POST, Method::DELETE, Method::PUT])
        .into_handler();

    let router = Router::new()
        .push(
            Router::with_path("/auth")
                .goal(handler::user::auth)
                .hoop(auth_handler),
        )
        .push(Router::with_path("/ws").goal(handler::ws::user_connected))
        .push(Router::with_path("/register").post(handler::user::register))
        .push(
            Router::with_path("/user")
                .push(Router::with_path("/updata_head").post(handler::user::updata_head))
                .push(Router::with_path("/get_user").post(handler::user::get_user))
                .push(Router::with_path("/get_user_posts").post(handler::post::get_user_posts)),
        )
        .push(
            Router::with_path("/posts")
                .get(handler::post::all_posts)
                .push(Router::with_path("/add_post").post(handler::post::add_post))
                .push(
                    Router::with_path("/<post_id>")
                        .post(handler::post::get_post)
                        .push(Router::with_path("/like_count").post(handler::like::get_like_count))
                        .push(
                            Router::with_path("/like/<user_id>")
                                .post(handler::like::add_like)
                                .delete(handler::like::delete_like),
                        )
                        .push(
                            Router::with_path("/comment")
                                .post(handler::comment::get_all_comment)
                                .push(
                                    Router::with_path("/comment_count")
                                        .post(handler::comment::get_comment_count),
                                )
                                .push(
                                    Router::with_path("/<comment_id>")
                                        .post(handler::comment::get_comment),
                                )
                                .push(
                                    Router::with_path("/add_comment")
                                        .post(handler::comment::add_comment),
                                ),
                        ),
                ),
        );
    let service = Service::new(router).hoop(cors);
    let acceptor = TcpListener::new("0.0.0.0:7878").bind().await;
    let server = Server::new(acceptor);
    let handle = server.handle();

    // 优雅地关闭服务器
    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(300)).await;
        handle.stop_graceful(None);
    });
    server.serve(service).await;
}
