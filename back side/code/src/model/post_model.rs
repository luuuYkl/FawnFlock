use crate::db::schema::posts;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Debug)]
#[diesel(table_name = posts)]
pub struct Post {
    pub post_id: i32,
    pub user_id: Option<i32>,
    pub content: Option<String>,
    pub image_url: Option<String>,
    pub video_url: Option<String>,
    pub audio_url: Option<String>,
    pub title: Option<String>,
    pub like_count: Option<i32>,
    pub comment_count: Option<i32>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub updated_at: Option<chrono::NaiveDateTime>,
}

#[derive(Insertable, Serialize, Deserialize, Debug)]
#[diesel(table_name = posts)]
pub struct NewPost<'a> {
    pub user_id: Option<i32>,
    pub content: Option<&'a str>,
    pub image_url: Option<&'a str>,
    pub video_url: Option<&'a str>,
    pub audio_url: Option<&'a str>,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub title: Option<&'a str>,
}
