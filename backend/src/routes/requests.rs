use crate::{
    middleware::auth::User,
    ops::{
        requests::{
            get_paginated_requests, get_requests_from, requests_by_status, requests_search,
            requests_search_suggestions, service_level_indicators, Order, RequestLog, RequestLogRequest,
        },
        stats::get_failure_to_success_stats,
        websocket::{authenticate_connection, close_session},
    },
    AppState,
};
use actix_web::{
    get,
    http::StatusCode,
    post,
    rt::{self, pin, time},
    web, HttpRequest, HttpResponse,
};
use actix_ws::Message;
use chrono::{DateTime, Datelike, Timelike, Utc};
use futures_util::{
    future::{self, Either},
    StreamExt,
};
use log::info;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::{Duration, Instant};

#[get("/")]
pub async fn index() -> HttpResponse {
    HttpResponse::Ok()
        .status(StatusCode::OK)
        .json(json!({"result":true}))
}

#[post("/append-request")]
pub async fn append_request(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Json<RequestLogRequest>,
) -> HttpResponse {
    let datetime = query.date.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string();
    let stmt = "INSERT INTO requests
        (date, endpoint, params, method, req_headers, res_headers, status, req_body, res_body, res_time)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)";

    let req_body = query.req_body.clone().unwrap_or_default();
    let res_body = query.res_body.clone().unwrap_or_default();
    let endpoint = query.url.split('?').next().unwrap_or_default();
    let params = query.url.split('?').nth(1).unwrap_or_default();

    match app_state.db_client.execute(
        stmt,
        params![
            datetime,
            endpoint,
            params,
            query.method,
            query.req_headers,
            query.res_headers,
            query.status,
            req_body.to_string(),
            res_body.to_string(),
            query.res_time
        ],
    ) {
        Ok(_) => HttpResponse::Ok()
            .status(StatusCode::OK)
            .json(json!({"result":"success"})),
        Err(e) => {
            info!("Failed to append request log: {}", e);
            HttpResponse::InternalServerError().json(json!({"msg": format!("Failed to append")}))
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum TimeRange {
    Today,
    PastWeek,
    PastMonth,
}
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LogTimeRange {
    pub from: DateTime<Utc>,
    pub to: Option<DateTime<Utc>>,
    pub limit: usize,
    pub index: usize,
    pub search: Option<String>,
    pub method: Option<String>,
    pub status: Option<String>,
    pub res_time_l_t: Option<String>,
    pub res_time_g_t: Option<String>,
}
#[get("/requests")]
pub async fn requests(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Query<LogTimeRange>,
) -> HttpResponse {
    // Get the current time
    match get_paginated_requests(
        query.from,
        query.to,
        query.index,
        query.limit,
        query.search.clone(),
        query.method.clone(),
        query.status.clone(),
        query.res_time_l_t.clone(),
        query.res_time_g_t.clone(),
        &app_state.db_client,
    ) {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to read log file: {:?}", e)})),
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, Copy)]
#[serde(rename_all = "camelCase")]
pub struct FromDate {
    pub from: DateTime<Utc>,
}
#[get("/requests-from")]
pub async fn requests_from(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Query<FromDate>,
) -> HttpResponse {
    match get_requests_from(
        query.0.from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
        Order::Ascending,
        &app_state.db_client,
    ) {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to read log file: {:?}", e)})),
    }
}

#[get("/requests-ws")]
async fn get_requests_socket(
    req: HttpRequest,
    app_state: web::Data<AppState>,
    stream: web::Payload,
) -> HttpResponse {
    let (res, mut session, mut stream) = match actix_ws::handle(&req, stream) {
        Ok(res) => res,
        Err(err) => {
            return HttpResponse::InternalServerError()
                .json(json!({ "msg": format!("Failed to establish websocket connection: {}", err) }));
        }
    };

    /// How often heartbeat pings are sent.
    ///
    /// Should be half (or less) of the acceptable client timeout.
    const HEARTBEAT_INTERVAL: Duration = Duration::from_millis(100);
    /// How long before lack of client response causes a timeout.
    const CLIENT_TIMEOUT: Duration = Duration::from_secs(5);
    /// Over how many authentication attempts the connection should be closed.
    const MAX_AUTH_ATTEMPTS: usize = 3;
    rt::spawn(async move {
        let mut last_heartbeat = Instant::now();
        let mut is_authenticated = false;
        let mut auth_attempt = 0;
        let connected_at = Utc::now();
        let mut interval = time::interval(HEARTBEAT_INTERVAL);
        let mut previous_last: Option<RequestLog> = None;

        loop {
            let tick = interval.tick();
            pin!(tick);
            // waits for either `stream` to receive a message from the client or the heartbeat
            // interval timer to tick, yielding the value of whichever one is ready first
            match future::select(stream.next(), tick).await {
                // received message from WebSocket client
                Either::Left((Some(Ok(msg)), _)) => {
                    match msg {
                        Message::Text(text) => {
                            // authentication
                            if !is_authenticated {
                                auth_attempt += 1;
                                is_authenticated = authenticate_connection(text.clone());
                                if auth_attempt >= MAX_AUTH_ATTEMPTS {
                                    close_session(&session).await;
                                }
                            }
                        }
                        Message::Binary(_) => {
                            // session.binary(bin).await.unwrap();
                        }
                        Message::Close(reason) => {
                            session.close(None).await.unwrap();
                            break reason;
                        }
                        Message::Ping(bytes) => {
                            last_heartbeat = Instant::now();
                            let _ = session.pong(&bytes).await;
                        }
                        Message::Pong(_) => {
                            last_heartbeat = Instant::now();
                        }
                        Message::Continuation(_) => {}
                        // no-op; ignore
                        Message::Nop => {}
                    };
                }

                // client WebSocket stream error
                Either::Left((Some(Err(_err)), _)) => {
                    session.close(None).await.unwrap();
                    break None;
                }
                // client WebSocket stream ended
                Either::Left((None, _)) => {
                    session.close(None).await.unwrap();
                    break None;
                }
                // heartbeat interval ticked
                Either::Right((_inst, _)) => {
                    // if no heartbeat ping/pong received recently, close the connection
                    if !is_authenticated
                        && Instant::now().duration_since(last_heartbeat) > CLIENT_TIMEOUT
                    {
                        session.close(None).await.unwrap();
                        break None;
                    } else if let Ok(result) = get_requests_from(
                        connected_at.format("%Y-%m-%dT%H:%M:%S.%3f").to_string(),
                        Order::Ascending,
                        &app_state.db_client,
                    ) {
                        if !result.is_empty()
                            && (previous_last.is_none()
                                || previous_last
                                    .clone()
                                    .is_some_and(|sp| sp.ne(result.last().unwrap())))
                        {
                            previous_last = Some(result.last().unwrap().clone());
                            session
                                .text(serde_json::to_string(&result).unwrap())
                                .await
                                .unwrap_or_default();
                        }
                    }
                    // send heartbeat ping
                    let _ = session.ping(b"").await;
                }
            }
        }
    });
    res
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Granularity {
    Hourly,
    Daily,
    Weekly,
    Monthly,
}
#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum StatType {
    Status,
}
#[derive(Serialize, Deserialize, Clone, Debug, Copy)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub stat_type: StatType,
    pub from: DateTime<Utc>,
    pub granularity: Granularity,
}

const DB_LOG_DATE_FORMAT: &str = "%Y-%m-%dT%H:%M:%S%.3fZ";
#[get("/requests-stats")]
async fn get_status_stats(
    _: User,
    app_state: web::Data<AppState>,

    query: web::Query<Stats>,
) -> HttpResponse {
    let results_from = get_requests_from(
        query.from.format(DB_LOG_DATE_FORMAT).to_string(),
        Order::Ascending,
        &app_state.db_client,
    );
    let mut chart_data = vec![];
    let delta = match query.granularity {
        Granularity::Hourly => chrono::Duration::hours(1),
        Granularity::Daily => chrono::Duration::days(1),
        Granularity::Weekly => chrono::Duration::weeks(1),
        Granularity::Monthly => chrono::Duration::weeks(4),
    };
    let mut from = query.from.naive_local();

    match query.granularity {
        Granularity::Hourly => from = from.with_minute(0).unwrap(),
        Granularity::Daily => from = from.with_hour(0).unwrap(),
        Granularity::Weekly => {
            from = from.with_day0(0).unwrap()
                - chrono::Duration::days(from.weekday().num_days_from_monday() as i64)
        }
        Granularity::Monthly => from = from.with_day0(0).unwrap(),
    }

    get_failure_to_success_stats(&results_from.unwrap(), from, delta, &mut chart_data);

    HttpResponse::Ok().json(chart_data)
}

#[derive(Serialize, Deserialize, Clone, Debug, Copy)]
#[serde(rename_all = "camelCase")]
pub struct StatsByStatus {
    pub from: DateTime<Utc>,
    pub limit: Option<usize>,
}
#[get("/requests-by-status")]
async fn get_requests_by_status(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Query<StatsByStatus>,
) -> HttpResponse {
    let results = requests_by_status(
        query.from.format(DB_LOG_DATE_FORMAT).to_string(),
        query.limit,
        &app_state.db_client,
    )
    .unwrap();
    HttpResponse::Ok().json(results)
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SearchByMethodAndKeyword {
    keyword: String,
    method: Option<String>,
    limit: Option<usize>,
}
#[get("/requests/search/suggestions")]
async fn get_requests_search_suggestions(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Query<SearchByMethodAndKeyword>,
) -> HttpResponse {
    let suggestions = requests_search_suggestions(
        query.keyword.clone(),
        query.method.clone(),
        query.limit,
        &app_state.db_client,
    );
    match suggestions {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to get search suggestions: {:?}", e)})),
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedSearch {
    keyword: String,
    method: Option<String>,
    index: usize,
    limit: usize,
    status: Option<String>,
    res_time_l_t: Option<String>,
    res_time_h_t: Option<String>,
}
#[get("/requests/search")]
async fn get_requests_search(
    _: User,
    app_state: web::Data<AppState>,
    query: web::Query<PaginatedSearch>,
) -> HttpResponse {
    let suggestions = requests_search(
        query.keyword.clone(),
        query.method.clone(),
        query.index,
        query.limit,
        &app_state.db_client,
    );
    match suggestions {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to get search suggestions: {:?}", e)})),
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
struct ServiceLevelIndicatorQuery {
    pub from: DateTime<Utc>,
}
#[get("/requests/sli")]
async fn get_service_level_indicators(
    _: User,
    query: web::Query<ServiceLevelIndicatorQuery>,
    app_state: web::Data<AppState>,
) -> HttpResponse {
    let indicators = service_level_indicators(query.from, &app_state.db_client);
    match indicators {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError()
            .json(json!({"msg": format!("Failed to get service level indicators: {:?}", e)})),
    }
}
