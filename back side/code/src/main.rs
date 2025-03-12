mod config;
mod db;
mod handler;
mod model;
mod router;

use salvo::prelude::*;

#[tokio::main]
async fn main() {
    // 初始化日志
    tracing_subscriber::fmt::init();

    // 初始化数据库连接池
    config::init_db_pool();

    // 创建服务
    let service = router::create_service();

    // 启动服务器
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
