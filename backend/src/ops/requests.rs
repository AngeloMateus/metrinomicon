use anyhow::Result;
use chrono::{DateTime, Utc};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::cmp;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RequestLogRequest {
    pub method: String,
    pub url: String,
    pub req_headers: String,
    pub res_headers: String,
    pub date: DateTime<Utc>,
    pub status: u16,
    pub req_body: Option<Value>,
    pub res_body: Option<Value>,
    pub res_time: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RequestLog {
    pub method: String,
    pub endpoint: String,
    pub params: String,
    pub req_headers: String,
    pub res_headers: String,
    pub date: DateTime<Utc>,
    pub status: u16,
    pub req_body: Option<Value>,
    pub res_body: Option<Value>,
    pub res_time: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedRequests {
    pub requests: Vec<RequestLog>,
    pub total_items: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseBody {
    pub date: String,
    pub response_body: String,
}

pub fn get_paginated_requests(
    from: DateTime<Utc>,
    to: Option<DateTime<Utc>>,
    index: usize,
    limit: usize,
    search: Option<String>,
    method: Option<String>,
    status: Option<String>,
    res_time_lt: Option<String>,
    res_time_gt: Option<String>,
    conn: &Connection,
) -> Result<Value> {
    // Get the current time
    let limit = format!("LIMIT {}", limit).to_string();
    let offset = format!("OFFSET {};", index).to_string();
    // Prepare the SQL query
    let mut stmt = conn.prepare(&format!(
        "
        WITH filtered_requests AS (
            SELECT *
            FROM requests
            WHERE date > ?1 AND date <= ?2
              AND endpoint LIKE ?3
              AND (method = ?4 OR ?4 = \"\" OR ?4 = \"ALL\")
              AND (status = ?5 OR ?5 = \"\")
              AND (res_time < ?6 OR ?6 = \"\")
              AND (res_time > ?7 OR ?7 = \"\")
        )
        SELECT *,
               (SELECT COUNT(*) FROM filtered_requests) AS total_count
        FROM filtered_requests
        ORDER BY date DESC
        {} {};
        ",
        limit, offset
    ))?;

    // Execute the query with the parameters
    let rows = stmt.query_map(
        params![
            from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
            to.unwrap_or(Utc::now())
                .format("%Y-%m-%dT%H:%M:%S%.3fZ")
                .to_string(),
            format!("%{}%", search.unwrap_or_default()),
            method.unwrap_or("ALL".to_string()),
            status.unwrap_or("".to_string()),
            res_time_lt.unwrap_or("".to_string()),
            res_time_gt.unwrap_or("".to_string())
        ],
        |row| {
            Ok((
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7)?,
                row.get::<_, String>(8)?,
                row.get::<_, String>(9)?,
                row.get::<_, u32>(10)?,
                row.get::<_, usize>(11)?,
            ))
        },
    )?;

    // Iterate over the results
    let mut requests = vec![];
    let mut total_items = 0;
    for row in rows {
        let (
            date,
            endpoint,
            params,
            method,
            req_headers,
            res_headers,
            status,
            reqb,
            resb,
            res_time,
            count,
        ) = row?;
        let log = RequestLog {
            date: DateTime::parse_from_rfc3339(&date)?.with_timezone(&Utc),
            endpoint,
            params,
            method,
            req_headers,
            res_headers,
            status: status.parse()?,
            req_body: serde_json::from_str(&reqb)?,
            res_body: serde_json::from_str(&resb)?,
            res_time,
        };
        total_items = count;

        requests.push(log);
    }

    let result = serde_json::to_value(PaginatedRequests {
        requests,
        total_items,
    })?;
    Ok(result)
}

#[derive(PartialEq, Eq)]
pub enum Order {
    Ascending,
    Descending,
}
pub fn get_requests_from(
    start_time: String,
    order: Order,
    conn: &Connection,
) -> Result<Vec<RequestLog>> {
    let order_by = match order {
        Order::Ascending => "ASC".to_string(),
        Order::Descending => "DESC".to_string(),
    };
    let mut stmt = conn.prepare(&format!(
        "
        SELECT *
        FROM requests
        WHERE date > ?1
        ORDER BY date {};
        ",
        order_by
    ))?;

    let rows = stmt.query_map(params![start_time], |row| {
        Ok((
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, String>(6)?,
            row.get::<_, String>(7)?,
            row.get::<_, String>(8)?,
            row.get::<_, String>(9)?,
            row.get::<_, u32>(10)?,
        ))
    })?;

    // Iterate over the results
    let mut results = vec![];
    for row in rows {
        let (date, endpoint, params, method, req_headers, res_headers, status, reqb, resb, res_time) =
            row?;
        let log = RequestLog {
            date: DateTime::parse_from_rfc3339(&date)?.with_timezone(&Utc),
            endpoint,
            params,
            method,
            req_headers,
            res_headers,
            status: status.parse()?,
            req_body: serde_json::from_str(&reqb)?,
            res_body: serde_json::from_str(&resb)?,
            res_time,
        };

        results.push(log);
    }

    Ok(results)
}

pub fn requests_by_status(
    start_time: String,
    limit: Option<usize>,
    conn: &Connection,
) -> Result<Vec<Value>> {
    // Prepare the SQL query
    let mut stmt = conn.prepare(
        format!(
            "WITH ranked_requests AS (
                SELECT
                    status,
                    endpoint,
                    COUNT(*) AS request_count,
                    ROW_NUMBER() OVER (PARTITION BY status ORDER BY COUNT(*) DESC) AS rank
                FROM
                    requests
                WHERE
                    date > ?1
                GROUP BY
                    endpoint,
                    status
            )
            SELECT
                status,
                endpoint,
                request_count
            FROM
                ranked_requests
            WHERE
                rank <= {}
            ORDER BY
                status,
                request_count DESC;
            ",
            limit.unwrap_or(3)
        )
        .as_str(),
    )?;

    // Execute the query with the parameters
    let rows = stmt.query_map(params![start_time], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, u32>(2)?,
        ))
    })?;

    // Iterate over the results
    let mut results = vec![];
    for row in rows {
        let (status, endpoint, req_count) = row?;
        results.push(json!({
            "status": status,
            "endpoint": endpoint,
            "request_count": req_count,
        }));
    }

    Ok(results)
}

pub fn requests_search_suggestions(
    keyword: String,
    method: Option<String>,
    limit: Option<usize>,
    conn: &Connection,
) -> Result<Value> {
    let mut stmt = conn.prepare(
        "
        SELECT * FROM requests
        WHERE SUBSTR(endpoint, 1, INSTR(endpoint || '?', '?') - 1) LIKE ?1
        AND (method = ?2 OR  ?2 IS NULL)
        LIMIT ?3;
        ",
    )?;

    let rows = stmt.query_map(
        params![format!("%{}%", keyword), method, limit.unwrap_or(5)],
        |row| row.get::<_, String>(2),
    )?;

    let mut results = vec![];
    for row in rows {
        let endpoint = row?;

        let pos = endpoint.find('?').unwrap_or(endpoint.len());

        if !results.contains(&endpoint[..pos].to_string()) {
            results.push(endpoint[..pos].to_string());
        }
    }
    Ok(json!(results))
}

pub fn requests_search(
    keyword: String,
    method: Option<String>,
    index: usize,
    limit: usize,
    conn: &Connection,
) -> Result<Value> {
    let mut stmt = conn.prepare(
        "
        SELECT * FROM requests
        WHERE endpoint LIKE ?1
        AND (method = ?2 OR  ?2 = \"\" OR ?2 = \"ALL\")
       	AND (status = ?3 OR ?3 = \"\")
        AND (res_time < ?4 OR ?4 = \"\")
        AND (res_time > ?5 OR ?5 = \"\")
        ORDER BY date DESC;
        ",
    )?;
    let method = method.unwrap_or("ALL".to_string());

    let rows = stmt.query_map(params![format!("%{}%", keyword), method,], |row| {
        Ok((
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
            row.get::<_, String>(4)?,
            row.get::<_, String>(5)?,
            row.get::<_, String>(6)?,
            row.get::<_, String>(7)?,
            row.get::<_, String>(8)?,
            row.get::<_, String>(9)?,
            row.get::<_, u32>(10)?,
        ))
    })?;

    let mut requests = vec![];
    for row in rows {
        let (date, endpoint, params, method, req_headers, res_headers, status, reqb, resb, res_time) =
            row?;
        let request = RequestLog {
            date: DateTime::parse_from_rfc3339(&date)?.with_timezone(&Utc),
            endpoint,
            params,
            method,
            req_headers,
            res_headers,
            status: status.parse()?,
            req_body: serde_json::from_str(&reqb)?,
            res_body: serde_json::from_str(&resb)?,
            res_time,
        };
        requests.push(request);
    }

    let len = requests.len();
    let spliced = requests
        .splice(index..cmp::min(index + limit, requests.len()), Vec::new())
        .collect::<Vec<RequestLog>>();
    Ok(json!(PaginatedRequests {
        requests: spliced,
        total_items: len,
    }))
}

/// Returns service level indicators by timeframe and previous timeframe:
/// * Overall Average Latency
/// * Throughput (req/s)
/// * Error rate (err/s)
pub fn service_level_indicators(from: DateTime<Utc>, conn: &Connection) -> Result<Value> {
    let mut stmt = conn.prepare(
        "
        SELECT
            AVG(res_time) AS average_res_time,  -- Average response time
            CASE
                WHEN (STRFTIME('%s', MAX(date)) - STRFTIME('%s', MIN(date))) = 0
                THEN 0  -- Handle division by zero
                ELSE COUNT(*) * 1.0 / (STRFTIME('%s', MAX(date)) - STRFTIME('%s', MIN(date)))  -- Requests per second
            END AS requests_per_second,
            COUNT(CASE WHEN status >= 400 THEN 1 END) * 1.0 / COUNT(*) AS error_rate  -- Error rate
        FROM requests
        WHERE date > ?1;
        ",
    )?;
    let rows = stmt.query_map(
        params![from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string()],
        |row| {
            let average_res_time = row.get::<_, f32>(0);
            let throughput = row.get::<_, f32>(1);
            let error_rate = row.get::<_, f32>(2);
            Ok((
                average_res_time.unwrap_or(0.),
                throughput.unwrap_or(0.),
                error_rate.unwrap_or(0.),
            ))
        },
    )?;
    let slis = rows.into_iter().next().transpose()?;

    let duration = Utc::now().signed_duration_since(from);
    let prev_from = from - duration;
    let mut prev_stmt = conn.prepare(
            "
            SELECT AVG(res_time) AS average_res_time,  -- Average response time
                CASE
                    WHEN (STRFTIME('%s', MAX(date)) - STRFTIME('%s', MIN(date))) = 0
                    THEN 0  -- Handle division by zero
                    ELSE COUNT(*) * 1.0 / (STRFTIME('%s', MAX(date)) - STRFTIME('%s', MIN(date)))  -- Requests per second
                END AS requests_per_second,
                COUNT(CASE WHEN status >= 500 THEN 1 END) * 1.0 / COUNT(*) AS error_rate  -- Error rate
            FROM requests
            WHERE date > ?1 AND date <= ?2;
            ",
        )?;
    let prev_rows = prev_stmt.query_map(
        params![
            prev_from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
            from.format("%Y-%m-%dT%H:%M:%S%.3fZ").to_string(),
        ],
        |row| {
            let average_res_time = row.get::<_, f32>(0);
            let throughput = row.get::<_, f32>(1);
            let error_rate = row.get::<_, f32>(2);
            Ok((
                average_res_time.unwrap_or(slis.unwrap_or((0.0, 0.0, 0.0)).0),
                throughput.unwrap_or(0.),
                error_rate.unwrap_or(0.),
            ))
        },
    )?;
    let prev_slis = prev_rows.into_iter().next().transpose()?;

    Ok(json!({
        "averageLatency": slis.unwrap_or((0.0,0.0,0.0)).0,
        "throughput":  slis.unwrap_or((0.0,0.0,0.0)).1,
        "errorRate": slis.unwrap_or((0.0,0.0,0.0)).2,
        "prevAverageLatency": prev_slis.unwrap_or((0.0,0.0,0.0)).0,
        "prevThroughput": prev_slis.unwrap_or((0.0,0.0,0.0)).1,
        "prevErrorRate": prev_slis.unwrap_or((0.0,0.0,0.0)).2,
    }))
}
