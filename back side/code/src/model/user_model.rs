use crate::db::schema::users;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Debug)]
#[diesel(table_name = users)]
pub struct User {
    pub user_id: i32,
    pub username: String,
    pub email: String,
    pub password: String,
    pub phone: Option<String>,
    //头像url
    pub avatar_url: Option<String>,
    //简介
    pub bio: Option<String>,
    //声纹数据
    pub voice_fingerprint: Option<String>,
    //创建时间
    pub created_at: Option<chrono::NaiveDateTime>,
    //更新时间
    pub updated_at: Option<chrono::NaiveDateTime>,
}

#[derive(Insertable, Serialize, Deserialize,Debug)]
#[diesel(table_name = users)]
pub struct NewUser<'a> {
    pub username: &'a str,
    pub email: &'a str,
    pub password: &'a str,
    pub phone: Option<&'a str>,
    pub avatar_url: Option<&'a str>,
    pub bio: Option<&'a str>,
    pub voice_fingerprint: Option<&'a str>,
    pub created_at: Option<chrono::NaiveDateTime>,
}
