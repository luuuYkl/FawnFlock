use diesel::mysql::MysqlConnection;
use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use dotenv::dotenv;
use once_cell::sync::OnceCell;
use salvo::cors::{Cors, CorsHandler};
use salvo::http::Method;
use salvo::jwt_auth::{ConstDecoder, JwtAuth, QueryFinder};
use serde::{Deserialize, Serialize};
use std::{env, vec};

#[derive(Debug, Serialize, Deserialize)]
pub struct JwtClaims {
    pub username: String,
    pub exp: i64,
}

pub type DbPool = Pool<ConnectionManager<MysqlConnection>>;

static DB_POOL: OnceCell<DbPool> = OnceCell::new();

pub(crate) fn connect() -> Result<PooledConnection<ConnectionManager<MysqlConnection>>, PoolError> {
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

pub fn init_db_pool() {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    DB_POOL
        .set(
            build_pool(&database_url, 10).expect(&format!("Error connecting to {}", &database_url)),
        )
        .ok();
}

pub fn create_jwt_auth() -> JwtAuth<JwtClaims, ConstDecoder> {
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    JwtAuth::new(ConstDecoder::from_secret(jwt_secret.as_bytes()))
        .finders(vec![Box::new(QueryFinder::new("jwt_token"))])
}

pub fn create_cors_handler() -> CorsHandler {
    Cors::new()
        .allow_methods(vec![
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_origin(vec!["http://localhost:3000", "http://localhost:8080"])
        .allow_headers(vec!["Content-Type", "Authorization"])
        .allow_credentials(true)
        .into_handler()
}
