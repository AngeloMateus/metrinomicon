use actix::Actor;
use actix_cors::Cors;
use actix_web::{
    web::{self},
    App, HttpResponse, HttpServer,
};
use db::connection::connect_db;
use dotenv::dotenv;
use ops::{
    auth::{generate_api_key, verify_encrypted_key},
    uptime::{restart_uptime_service, UptimeActor},
};
use routes::{
    auth::authenticate,
    requests::{
        append_request, get_requests_by_status, get_requests_search, get_requests_search_suggestions,
        get_requests_socket, get_service_level_indicators, get_status_stats, index, requests,
        requests_from,
    },
    uptime::{delete_uptime_setting, get_uptime_percentage, get_uptime_settings, setup_uptime_ping},
};
use rusqlite::Connection;
use std::{env, process};

mod db;
mod middleware;
mod ops;
mod routes;

#[derive(Debug)]
struct AppState {
    db_client: Connection,
    db_path: String,
    require_auth: bool,
    uptime_actor: actix::Addr<UptimeActor>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    let require_auth = !(args.len() > 1 && args[1] == "--no-auth");
    handle_cli_args(args);

    dotenv().ok();
    env_logger::init();
    let api_ip = env::var("API_IP").expect("API_IP missing");
    let api_port = env::var("API_PORT").expect("API_PORT missing");
    let db_path = env::var("DB_PATH").expect("DB_PATH missing");

    let uptime_actor = UptimeActor {
        is_running: false,
        settings: vec![],
    }
    .start();

    HttpServer::new(move || {
        let db_client = connect_db(&db_path);
        // Set the update hook
        let db_client = restart_uptime_service(db_client, &uptime_actor, db_path.clone());

        let cors = Cors::default()
            .allowed_origin_fn(|origin, _req_head| origin.as_bytes().starts_with(b"http://localhost"))
            .allowed_methods(vec!["GET", "POST", "OPTIONS", "DELETE"])
            .allow_any_header()
            .max_age(3600);
        App::new()
            .wrap(cors)
            //PUBLIC ROUTES
            .app_data(web::Data::new(AppState {
                db_client,
                db_path: db_path.clone(),
                require_auth,
                uptime_actor: uptime_actor.clone(),
            }))
            .service(index)
            .service(authenticate)
            .service(append_request)
            .service(requests)
            .service(requests_from)
            .service(get_requests_socket)
            .service(get_status_stats)
            .service(get_requests_by_status)
            .service(setup_uptime_ping)
            .service(get_uptime_percentage)
            .service(get_uptime_settings)
            .service(delete_uptime_setting)
            .service(get_requests_search_suggestions)
            .service(get_requests_search)
            .service(get_service_level_indicators)
            .default_service(web::to(HttpResponse::NotFound))
    })
    .bind((
        api_ip.as_str(),
        api_port.parse::<u16>().expect("API_PORT should be a valid u16"),
    ))?
    .run()
    .await
}

fn handle_cli_args(args: Vec<String>) {
    if args.len() < 2 {
        return;
    }
    match args[1].as_str() {
        "--keygen" => {
            generate_api_key(args[2].clone(), args[3].clone());
            process::exit(0);
        }
        "--verify" => {
            let api_key = args[2].clone();
            let hashed_key = args[3].clone();
            let is_valid = verify_encrypted_key(&api_key, &hashed_key);
            println!("Key is valid: {}", is_valid);
            process::exit(0);
        }
        "--no-auth" => {
            println!("Skipping authorization");
        }
        _ => println!("Invalid argument, ignoring"),
    }
}
