use crate::db::schema::likes;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Debug,Insertable)]
#[diesel(table_name = likes)]
pub struct Like {
    pub post_id: i32,
    pub user_id: i32,
    pub like_date: Option<chrono::NaiveDateTime>,
}
