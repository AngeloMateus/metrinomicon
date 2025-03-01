use crate::{middleware::auth::User, AppState};
use actix_web::{post, web, HttpResponse};
use serde_json::json;

#[post("/auth")]
pub async fn authenticate(user: User, _app_state: web::Data<AppState>) -> HttpResponse {
    if let Some(credentials) = user.credentials {
        let api_key = credentials.api_key;
        let user = credentials.user;

        return HttpResponse::Ok().json(json!({"token": format!("{}:{}", api_key, user)}));
    }
    HttpResponse::Ok().json(json!({"token": "authorization_skipped" }))
}
