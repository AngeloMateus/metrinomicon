use crate::{
    middleware::auth::User,
    ops::uptime::{
        delete_uptime_setting_db, uptime_percentage, uptime_percentage_per_hour, uptime_settings,
        UptimePingMessage,
    },
    AppState,
};
use actix_web::{
    delete, get,
    http::StatusCode,
    post,
    web::{self, Query},
    HttpResponse,
};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use serde_json::json;
use strum::Display;

#[derive(Serialize, Deserialize, Display, Debug, Clone, PartialEq)]
#[allow(clippy::upper_case_acronyms)]
pub enum Method {
    GET,
    POST,
    PUT,
    DELETE,
}
impl std::str::FromStr for Method {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_uppercase().as_str() {
            "GET" => Ok(Method::GET),
            "POST" => Ok(Method::POST),
            "PUT" => Ok(Method::PUT),
            "DELETE" => Ok(Method::DELETE),
            _ => Err(format!("'{}' is not a valid HTTP method", s)),
        }
    }
}
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct UptimeSetting {
    pub url: String,
    pub interval: Option<usize>,
    pub method: Option<Method>,
    pub enabled: Option<bool>,
    pub name: String,
}

#[get("/uptime-settings")]
pub async fn get_uptime_settings(_: User, app_state: web::Data<AppState>) -> HttpResponse {
    match uptime_settings(&app_state.db_client) {
        Ok(uptime_settings) => HttpResponse::Ok().json(json!(uptime_settings)),
        Err(_) => HttpResponse::InternalServerError()
            .json(json!({"msg": "Failed to retrieve uptime settings"})),
    }
}

#[post("/uptime-settings")]
pub async fn setup_uptime_ping(
    _: User,
    app_state: web::Data<AppState>,
    body: web::Json<UptimeSetting>,
) -> HttpResponse {
    let db_path = app_state.db_path.to_string();

    let uptime_actor = app_state.uptime_actor.clone();
    let interval = body.interval.unwrap_or(60);

    let stmt = "
          INSERT INTO uptime_settings (url, interval, method, enabled, name)
          VALUES (?1, ?2, ?3, ?4, ?5)
        ";
    match app_state.db_client.execute(
        stmt,
        params![
            body.url,
            interval.to_string(),
            body.method.clone().unwrap_or(Method::GET).to_string(),
            body.enabled.unwrap_or(true),
            body.name
        ],
    ) {
        Ok(_) => {
            let _ = uptime_actor
                .send(UptimePingMessage {
                    msg: "enable",
                    settings: Some(body.0.clone()),
                    db_path: Some(db_path),
                    url: None,
                })
                .await;

            HttpResponse::Ok()
                .status(StatusCode::OK)
                .json(json!({"result":"success"}))
        }
        Err(_) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to setup uptime ping, is the url already setup?")})),
    }
}

#[derive(Deserialize)]
struct DeleteUptimeSettings {
    url: String,
}
#[delete("/uptime-settings")]
pub async fn delete_uptime_setting(
    _: User,
    query: web::Query<DeleteUptimeSettings>,
    app_state: web::Data<AppState>,
) -> HttpResponse {
    let db_path = app_state.db_path.clone();
    let uptime_actor = app_state.uptime_actor.clone();
    match delete_uptime_setting_db(&app_state.db_client, query.url.clone()) {
        Ok(_) => {
            let _ = uptime_actor
                .send(UptimePingMessage {
                    msg: "disable",
                    settings: None,
                    db_path: Some(db_path),
                    url: Some(query.url.clone()),
                })
                .await;

            HttpResponse::Ok()
                .status(StatusCode::OK)
                .json(json!({"result":"success"}))
        }
        Err(_) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to delete uptime settings")})),
    }
}

#[derive(Serialize, Deserialize, Display, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum UptimeType {
    PerHour,
    Total,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Uptime {
    pub uptime_type: UptimeType,
}
#[get("/uptime")]
pub async fn get_uptime_percentage(
    _: User,
    app_state: web::Data<AppState>,
    query: Query<Uptime>,
) -> HttpResponse {
    match query.uptime_type {
        UptimeType::PerHour => match uptime_percentage_per_hour(&app_state.db_client) {
            Ok(results) => HttpResponse::Ok().json(json!(results)),
            Err(_) => HttpResponse::InternalServerError()
                .json(json!({"msg": "Failed to retrieve uptime percentage per hour"})),
        },
        UptimeType::Total => match uptime_percentage(&app_state.db_client) {
            Ok(results) => HttpResponse::Ok().json(json!(results)),
            Err(_) => HttpResponse::InternalServerError()
                .json(json!({"msg": "Failed to retrieve uptime percentage"})),
        },
    }
}
