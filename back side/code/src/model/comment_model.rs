use crate::db::schema::comments;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Debug)]
#[diesel(table_name = comments)]
pub struct Comment {
    pub comment_id: i32,
    pub post_id: Option<i32>,
    pub user_id: Option<i32>,
    pub comment: String,
    pub created_at: Option<chrono::NaiveDateTime>,
}

#[derive(Insertable, Serialize, Deserialize,Debug)]
#[diesel(table_name = comments)]
pub struct NewComment<'a> {
    pub post_id: Option<i32>,
    pub user_id: Option<i32>,
    pub comment: &'a str,
    pub created_at: Option<chrono::NaiveDateTime>,
}