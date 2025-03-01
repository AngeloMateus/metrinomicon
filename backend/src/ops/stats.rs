use super::requests::RequestLog;
use chrono::{Duration, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};

pub const RESPONSE_LOG_DATE_FORMAT: &str = "%d-%m-%Y %H:%M:%S%.3f";
#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FailureToSuccessRate {
    pub date: String,
    pub failure_rate: f64,
    pub total_requests: usize,
}

pub fn get_failure_to_success_stats(
    results: &[RequestLog],
    mut from: NaiveDateTime,
    delta: Duration,
    chart_data: &mut Vec<FailureToSuccessRate>,
) {
    while from < Utc::now().naive_local() {
        let next_time = from + delta;
        let count = results
            .iter()
            .filter(|log| {
                let log_time = log.date.naive_local();
                log_time >= from && log_time < next_time && log.status >= 500
            })
            .count();
        let total_requests = results
            .iter()
            .filter(|log| {
                let log_time = log.date.naive_local();
                log_time >= from && log_time < next_time
            })
            .count();
        let average_failures = if total_requests > 0 {
            count as f64 / total_requests as f64
        } else {
            0.0
        };
        chart_data.push(FailureToSuccessRate {
            date: from.format(RESPONSE_LOG_DATE_FORMAT).to_string(),
            failure_rate: average_failures,
            total_requests,
        });
        from = next_time;
    }
}
