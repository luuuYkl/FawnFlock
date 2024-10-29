use crate::connect;
use crate::db::schema::users::dsl::*;
use crate::model::user_model::{NewUser, User};
use crate::JwtClaims;

use diesel::prelude::*;
use dotenv::dotenv;
use jsonwebtoken::EncodingKey;
use salvo::http::Method;
use salvo::{prelude::*, Error};
use serde::Deserialize;
use std::env;

#[derive(Deserialize)]
struct Info {
    username: String,
    data: String,
}

#[handler]
pub async fn register(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let mut new_user = req.parse_json::<NewUser>().await?;
    new_user.created_at = Some(chrono::Utc::now().naive_utc() + chrono::Duration::hours(8));
    let result = diesel::insert_into(users)
        .values(&new_user)
        .execute(&mut conn);
    match result {
        Ok(_) => {
            res.render(format!(
                "success register user {} at {}",
                new_user.username,
                new_user.created_at.unwrap()
            ));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn updata_head(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let info = req.parse_json::<Info>().await?;
    let result = diesel::update(users.filter(username.eq(&info.username)))
        .set(avatar_url.eq(&info.data))
        .execute(&mut conn);
    match result {
        Ok(_) => {
            res.render(format!("success updata user {}'s head", info.username));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn get_user(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let mut conn = connect().unwrap();
    let info = req.parse_json::<Info>().await?;
    let result = users
        .filter(username.eq(&info.username))
        .first::<User>(&mut conn);
    match result {
        Ok(user) => {
            res.render(Json(user));
            Ok(())
        }
        Err(e) => {
            res.render(Json(&e.to_string()));
            Ok(())
        }
    }
}

#[handler]
pub async fn auth(req: &mut Request, depot: &mut Depot, res: &mut Response) -> Result<(), Error> {
    if req.method() == Method::POST {
        let mut conn = connect().unwrap();
        let info = req.parse_json::<Info>().await?;
        let result = users
            .filter(username.eq(&info.username))
            .filter(password.eq(&info.data))
            .first::<User>(&mut conn);
        match result {
            Ok(_) => {
                let exp = chrono::Utc::now() + chrono::Duration::days(14);
                let claim = JwtClaims {
                    username: info.username,
                    exp: exp.timestamp(),
                };
                dotenv().ok();
                let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
                let token = jsonwebtoken::encode(
                    &jsonwebtoken::Header::default(),
                    &claim,
                    &EncodingKey::from_secret(secret.as_bytes()),
                )
                .unwrap();
                res.render(Text::Plain(token));
                return Ok(());
            }
            Err(e) => {
                res.render(Json(&e.to_string()));
                return Ok(());
            }
        }
    } else {
        match depot.jwt_auth_state() {
            JwtAuthState::Authorized => {
                let data = depot.jwt_auth_data::<JwtClaims>().unwrap();
                res.render(Text::Plain(format!(
                    "Hi {}, have logged in successfully!",
                    data.claims.username
                )));
            }
            JwtAuthState::Unauthorized => {
                res.render(StatusError::unauthorized());
            }
            JwtAuthState::Forbidden => {
                res.render(StatusError::forbidden());
            }
        }
    }
    Ok(())
}
