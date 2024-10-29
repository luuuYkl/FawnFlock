use crate::connect;
use crate::db::schema::comments::dsl::*;
use crate::model::comment_model::{Comment, NewComment};

use crate::handler::post::{*,self};

use diesel::prelude::*;
use salvo::{prelude::*, Error};

#[handler]
pub async fn get_comment(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let p_id = req.param::<i32>("post_id").unwrap();
    let u_id = req.param::<i32>("comment_id").unwrap();
    let result = comments
        .filter(post_id.eq(p_id))
        .filter(comment_id.eq(u_id))
        .load::<Comment>(&mut conn);
    match result {
        Ok(data) => {
            res.render(Json(data));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn add_comment(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let mut new_comment = req.parse_json::<NewComment>().await?;
    let p_id = new_comment.post_id.unwrap();
    new_comment.created_at = Some(chrono::Utc::now().naive_utc() + chrono::Duration::hours(8));
    let result = diesel::insert_into(comments)
        .values(&new_comment)
        .execute(&mut conn);
    match result {
        Ok(_) => {
            change_comment_count(p_id, res, 1)
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn get_comment_count(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let p_id = req.param::<i32>("post_id").unwrap();
    post::get_comment_count(p_id, res)
}
