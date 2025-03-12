use crate::config::{create_cors_handler, create_jwt_auth};
use crate::handler;
use salvo::prelude::*;

pub fn create_router() -> Router {
    Router::new()
        .push(Router::with_path("/ws").goal(handler::ws::user_connected))
        .push(Router::with_path("/register").post(handler::user::register))
        .push(Router::with_path("/login").post(handler::user::auth))
        .push(
            Router::with_path("/user")
                .push(Router::with_path("/get_user").post(handler::user::get_user))
                .push(Router::with_path("/updata_head").post(handler::user::updata_head).hoop(create_jwt_auth()))
                .push(Router::with_path("/get_user_posts").post(handler::post::get_user_posts))
                .push(Router::with_path("/collect_voice").post(handler::voice::collect_voice_fingerprint))
                .push(Router::with_path("/text_to_speech").post(handler::voice::text_to_speech))
        )
        .push(
            Router::with_path("/posts")
                .get(handler::post::all_posts)
                .push(
                    Router::with_path("/add_post")
                        .post(handler::post::add_post)
                        .hoop(create_jwt_auth())
                )
                .push(
                    Router::with_path("/<post_id>")
                        .post(handler::post::get_post)
                        .push(Router::with_path("/like_count").post(handler::like::get_like_count))
                        .push(
                            Router::with_path("/like/<user_id>")
                                .post(handler::like::add_like)
                                .delete(handler::like::delete_like)
                                .hoop(create_jwt_auth())
                        )
                        .push(
                            Router::with_path("/comment")
                                .post(handler::comment::get_all_comment)
                                .push(
                                    Router::with_path("/comment_count")
                                        .post(handler::comment::get_comment_count)
                                )
                                .push(
                                    Router::with_path("/<comment_id>")
                                        .post(handler::comment::get_comment)
                                )
                                .push(
                                    Router::with_path("/add_comment")
                                        .post(handler::comment::add_comment)
                                        .hoop(create_jwt_auth())
                                )
                        )
                )
        )
}

pub fn create_service() -> Service {
    Service::new(create_router()).hoop(create_cors_handler())
}