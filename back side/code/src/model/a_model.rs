use crate::db::a::a;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Queryable, Insertable,Debug)]
#[diesel(table_name = a)]
pub struct A {
    pub account: String,
    pub psd: String,
}