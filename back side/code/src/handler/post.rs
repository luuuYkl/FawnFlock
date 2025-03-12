use crate::config::connect;
use crate::db::schema::posts::dsl::*;
use crate::model::post_model::{NewPost, Post};

use diesel::prelude::*;
use salvo::{prelude::*, Error};

#[handler]
pub async fn add_post(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let mut new_post = req.parse_json::<NewPost>().await?;
    new_post.created_at = Some(chrono::Utc::now().naive_utc() + chrono::Duration::hours(8));
    let result = diesel::insert_into(posts)
        .values(&new_post)
        .execute(&mut conn);
    match result {
        Ok(_) => {
            res.render(Json("success add post"));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn get_post(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let id = req.param::<i32>("post_id").unwrap();
    let result = posts.filter(post_id.eq(id)).first::<Post>(&mut conn);
    match result {
        Ok(post) => {
            res.render(Json(post));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn get_user_posts(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let id = req.query::<i32>("user_id").unwrap();
    let result = posts.filter(user_id.eq(id)).load::<Post>(&mut conn);
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
pub async fn all_posts(res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let result = posts.load::<Post>(&mut conn);
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

pub fn change_like_count(p_id: i32, res: &mut Response, add: i32) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let result = diesel::update(posts.filter(post_id.eq(p_id)))
        .set(like_count.eq(like_count + add))
        .execute(&mut conn);
    match result {
        Ok(_) => {
            if add == 1 {
                res.render(Json("success add like"));
            }
            if add == -1 {
                res.render(Json("success delete like"));
            }
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

pub fn change_comment_count(p_id: i32, res: &mut Response, add: i32) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let result = diesel::update(posts.filter(post_id.eq(p_id)))
        .set(comment_count.eq(comment_count + add))
        .execute(&mut conn);
    match result {
        Ok(_) => {
            if add == 1 {
                res.render(Json("success add comment"));
            }
            if add == -1 {
                res.render(Json("success delete comment"));
            }
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

pub fn get_like_count(p_id: i32, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let result = posts.filter(post_id.eq(p_id)).first::<Post>(&mut conn);
    match result {
        Ok(data) => {
            res.render(Json(data.like_count));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

pub fn get_comment_count(p_id: i32, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let result = posts.filter(post_id.eq(p_id)).first::<Post>(&mut conn);
    match result {
        Ok(data) => {
            res.render(Json(data.comment_count));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}
