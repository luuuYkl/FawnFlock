use crate::connect;
use crate::db::schema::likes::dsl::*;
use crate::model::like_model::Like;

use crate::handler::post::{self, *};

use diesel::prelude::*;
use salvo::{prelude::*, Error};

#[handler]
pub async fn get_like_count(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let p_id = req.param::<i32>("post_id").unwrap();
    post::get_like_count(p_id, res)
}

#[handler]
pub async fn add_like(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let p_id = req.param::<i32>("post_id").unwrap();
    let u_id = req.param::<i32>("user_id").unwrap();
    let new_like = Like {
        post_id: p_id,
        user_id: u_id,
        like_date: Some(chrono::Utc::now().naive_utc() + chrono::Duration::hours(8)),
    };
    let result = diesel::insert_into(likes)
        .values(&new_like)
        .execute(&mut conn);
    match result {
        Ok(_) => change_like_count(new_like.post_id, res, 1),
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn delete_like(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let p_id = req.param::<i32>("post_id").unwrap();
    let u_id = req.param::<i32>("user_id").unwrap();
    let result =
        diesel::delete(likes.filter(post_id.eq(p_id)).filter(user_id.eq(u_id))).execute(&mut conn);
    match result {
        Ok(_) => change_like_count(p_id, res, -1),
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}
