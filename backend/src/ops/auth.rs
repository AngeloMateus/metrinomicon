use chrono::Utc;
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::env;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct AccessToken {
    pub sub: String, //subject username
    pub id: String,
    pub exp: usize,
    pub iat: usize, //issued at
}

#[allow(unused)]
pub fn is_expired(exp: usize) -> bool {
    let now = Utc::now().timestamp();
    let exp = exp as i64;
    now > exp
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiKeyEntry {
    hashed_key: String,
    description: String,
}

pub fn generate_api_key(client_id: String, desc: String) {
    let api_key = Uuid::new_v4().to_string();

    dotenv().ok();

    //Encrypt using the secret key
    let secret_key = env::var("SECRET_KEY").expect("SECRET_KEY missing");
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", api_key, secret_key));
    let encrypted_key = format!("{:x}", hasher.finalize());

    //Get all keys from file
    let mut api_keys: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string("api_keys.json").unwrap_or_else(|_| "{}".to_string()),
    )
    .expect("Failed to parse API keys file");

    let entry = ApiKeyEntry {
        hashed_key: encrypted_key.clone(),
        description: desc,
    };

    api_keys[client_id.clone()] =
        serde_json::to_value(entry).expect("Failed to serialize API key entry");
    println!("Generated key:\n\n  Username:\t{client_id}\n  API Key:\t{api_key}\n",);
    println!("Added to api_keys.json");

    std::fs::write(
        "api_keys.json",
        serde_json::to_string_pretty(&api_keys).expect("Failed to serialize API keys"),
    )
    .expect("Failed to write API keys file");
}

pub fn verify_encrypted_key_for_client(api_key: &str, client: &str) -> bool {
    let api_keys: serde_json::Value = serde_json::from_str(
        &std::fs::read_to_string("api_keys.json").unwrap_or_else(|_| "{}".to_string()),
    )
    .expect("Failed to parse API keys file");

    let entry: ApiKeyEntry =
        serde_json::from_value(api_keys[client].clone()).expect("Failed to parse API key entry");

    verify_encrypted_key(api_key, &entry.hashed_key)
}

pub fn verify_encrypted_key(api_key: &str, encrypted: &str) -> bool {
    let secret_key = env::var("SECRET_KEY").expect("SECRET_KEY missing");
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}", api_key, secret_key));
    let encrypted_key = format!("{:x}", hasher.finalize());
    encrypted == encrypted_key
}
