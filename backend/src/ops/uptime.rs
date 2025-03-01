use crate::routes::uptime::{Method, UptimeSetting};
use actix::prelude::*;
use actix_web::rt::{self, pin, time};
use anyhow::{anyhow, Result};
use awc::Client;
use chrono::Utc;
use log::info;
use rusqlite::{params, Connection};
use serde_json::{json, Value};
use std::{str::FromStr, time::Duration};

#[derive(Message)]
#[rtype(result = "Result<bool, std::io::Error>")]
pub struct UptimePingMessage {
    pub msg: &'static str,
    pub settings: Option<UptimeSetting>,
    pub url: Option<String>,
    pub db_path: Option<String>,
}

pub struct UptimeActor {
    pub is_running: bool,
    pub settings: Vec<UptimeSetting>,
}

impl Actor for UptimeActor {
    type Context = Context<Self>;
    fn started(&mut self, _ctx: &mut Context<Self>) {
        info!("Started uptime actor");
    }
    fn stopped(&mut self, _ctx: &mut Context<Self>) {
        info!("Stopped uptime actor");
    }
}

impl Handler<UptimePingMessage> for UptimeActor {
    type Result = Result<bool, std::io::Error>;

    fn handle(&mut self, message: UptimePingMessage, ctx: &mut Context<Self>) -> Self::Result {
        if message.msg.eq("disable") {
            self.is_running = false;
            self.settings.retain(|x| x.url.ne(&message.url.clone().unwrap()));
        }
        if message.msg.eq("ping_mailbox") {
            // println!("ping mailbox");
        }
        if message.msg.eq("enable") {
            self.is_running = true;
            if !self.settings.contains(&message.settings.clone().unwrap()) {
                self.settings.push(message.settings.clone().unwrap());
                start_uptime_heartbeat(
                    message.db_path.unwrap(),
                    message.settings.unwrap(),
                    ctx.address(),
                );
            } else {
                // replace the url with new settings
                self.settings
                    .retain(|x| x.url != message.settings.clone().unwrap().url);
                self.settings.push(message.settings.clone().unwrap());
            }
        }
        // Check if a URL is pinging
        if message.msg.eq("is_enabled") {
            return Ok(self
                .settings
                .iter()
                .map(|s| s.url.clone())
                .collect::<Vec<String>>()
                .contains(&message.url.unwrap().clone()));
        }
        Ok(self.is_running)
    }
}

pub fn uptime_percentage(conn: &Connection) -> Result<Vec<Value>> {
    let mut results = Vec::new();
    let mut stmt = conn.prepare(
        "
        SELECT
            url,
            CASE
                WHEN COUNT(*) = 0 THEN
                    CASE
                        WHEN COUNT(CASE WHEN status = 'up' THEN 1 END) > 0 THEN 100
                        ELSE 0
                    END
                ELSE
                    (COUNT(CASE WHEN status = 'up' THEN 1 END) * 1.0 / COUNT(*)) * 100
            END AS uptime
        FROM uptime
        GROUP BY url;
        ",
    )?;
    match stmt.query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))) {
        Ok(mapped_rows) => {
            for row in mapped_rows {
                match row {
                    Ok((url, uptime_percentage)) => {
                        results.push(json!({ "url": url, "uptime": uptime_percentage }))
                    }
                    Err(err) => {
                        return Err(anyhow!("Error mapping row: {:?}", err));
                    }
                }
            }
        }
        Err(_) => {
            return Err(anyhow!("Error querying db"));
        }
    };
    Ok(results)
}

pub fn delete_uptime_setting_db(conn: &Connection, url: String) -> Result<()> {
    conn.execute_batch(
        format!(
            "BEGIN TRANSACTION; DELETE FROM uptime_settings WHERE url = '{0}'; DELETE FROM uptime WHERE url = '{0}'; COMMIT; ",
            url
        )
        .as_str(),
    )?;

    Ok(())
}

pub fn uptime_percentage_per_hour(conn: &Connection) -> Result<Vec<Value>> {
    let mut results = Vec::new();
    let mut stmt = conn.prepare(
        "
        SELECT
            url,
            strftime('%Y-%m-%d %H:00:00', timestamp) AS hour,
            (SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS uptime_percentage
        FROM
            uptime
        GROUP BY
            url, hour;
        ",
    )?;
    match stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, f64>(2).unwrap_or(0.),
        ))
    }) {
        Ok(mapped_rows) => {
            for row in mapped_rows {
                match row {
                    Ok((url, hour, uptime_percentage)) => {
                        results.push(json!({ "url": url, "uptime": uptime_percentage, "hour":hour }))
                    }
                    Err(err) => {
                        return Err(anyhow!("Error mapping row: {:?}", err));
                    }
                }
            }
        }
        Err(err) => {
            return Err(anyhow!("Error querying db: {:?}", err));
        }
    };
    Ok(results)
}

pub fn uptime_settings(conn: &Connection) -> Result<Vec<UptimeSetting>> {
    let mut stmt = match conn.prepare("SELECT * FROM uptime_settings") {
        Ok(stmt) => stmt,
        Err(err) => return Err(anyhow!(err)),
    };

    let uptime_settings_iter = match stmt.query_map([], |row| {
        let method: String = row.get(2)?;
        Ok(UptimeSetting {
            url: row.get(0)?,
            interval: row.get(1)?,
            method: Some(
                Method::from_str(&method)
                    .map_err(|_| anyhow!("Invalid method"))
                    .expect("Invalid method"),
            ),
            enabled: row.get(3)?,
            name: row.get(4)?,
        })
    }) {
        Ok(iter) => iter,
        Err(err) => return Err(anyhow!(err)),
    };

    let mut uptime_settings = Vec::new();
    for setting in uptime_settings_iter {
        match setting {
            Ok(setting) => uptime_settings.push(setting),
            Err(err) => return Err(anyhow!(err)),
        }
    }
    Ok(uptime_settings)
}

/// Pings the url and logs in the db whether it is up or down
pub async fn append_uptime(conn: &Connection, url: String) {
    let client = Client::default();

    let res = client.get(url.clone()).send().await;
    let status = if res.is_ok() { "up" } else { "down" };
    let timestamp = Utc::now().to_rfc3339();
    info!("Appending up status for {}", url);

    let stmt = "
        INSERT INTO uptime (status, timestamp, url)
        VALUES (?1, ?2, ?3)
    ";
    match conn.execute(stmt, params![status, timestamp, url]) {
        Ok(_) => (),
        Err(e) => info!("Error inserting into database: {}", e),
    }
}

pub fn start_uptime_heartbeat(db_path: String, body: UptimeSetting, _addr: Addr<UptimeActor>) {
    let heartbeat_interval = Duration::from_secs(body.interval.unwrap_or(60) as u64);

    // Opens a new db connection specifically for uptime pings
    let conn = match Connection::open(db_path.clone()) {
        Ok(conn) => conn,
        Err(err) => panic!("Error opening database: {:?}", err),
    };

    let mut interval = time::interval(heartbeat_interval);
    rt::spawn(async move {
        loop {
            interval.reset();
            let exists = conn.query_row(
                "SELECT * FROM uptime_settings WHERE url = ?1",
                [body.url.clone()],
                |row| row.get::<_, String>(0),
            );
            match exists {
                Ok(_) => {
                    append_uptime(&conn, body.url.clone()).await;
                }
                Err(_) => {
                    break;
                }
            };
            let tick = interval.tick();
            pin!(tick);
            tick.await;
        }
    });
}

pub fn restart_uptime_service(
    conn: Connection,
    addr: &Addr<UptimeActor>,
    db_path: String,
) -> Connection {
    //get all uptime settings
    let settings = uptime_settings(&conn);
    if let Ok(settings) = settings {
        //enable all settings
        for setting in settings {
            if setting.enabled.is_some_and(|enabled| enabled) {
                addr.do_send(UptimePingMessage {
                    msg: "enable",
                    settings: Some(setting),
                    db_path: Some(db_path.clone()),
                    url: None,
                });
            }
        }
    }
    conn
}
