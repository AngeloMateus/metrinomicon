use crate::{ops::auth::verify_encrypted_key_for_client, AppState};
use actix_web::{dev::Payload, error::ErrorUnauthorized, Error, *};
use log::info;
use serde::{Deserialize, Serialize};
use std::{future::Future, pin::Pin};
use web::Data;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserCredentials {
    pub api_key: String,
    pub user: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub credentials: Option<UserCredentials>,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let req = req.clone();
        let state = req.app_data::<Data<AppState>>().unwrap();
        if !state.require_auth {
            return Box::pin(async move { Ok(User { credentials: None }) });
        }

        Box::pin(async move {
            let api_key = req.headers().get("X-API-KEY");
            if let Some(key) = api_key {
                let key_str = key.to_str().unwrap();
                let parts: Vec<&str> = key_str.split(':').collect();
                if parts.len() != 2 {
                    return Err(ErrorUnauthorized("Invalid API key format"));
                }
                let key = parts[0];
                let client = parts[1];

                let verified = verify_encrypted_key_for_client(key, client);
                if !verified {
                    return Err(ErrorUnauthorized("Invalid API key"));
                }

                Ok(User {
                    credentials: Some(UserCredentials {
                        api_key: key.to_string(),
                        user: client.to_string(),
                    }),
                })
            } else {
                Err(ErrorUnauthorized("Missing X-API-KEY  header"))
            }
        })
    }

    fn extract(req: &HttpRequest) -> Self::Future {
        let req = req.clone();
        let state = req.app_data::<Data<AppState>>().unwrap();
        if !state.require_auth {
            return Box::pin(async move { Ok(User { credentials: None }) });
        }

        Box::pin(async move {
            let api_key = req.headers().get("X-API-KEY");
            if let Some(key) = api_key {
                let key_str = key.to_str().unwrap();
                let parts: Vec<&str> = key_str.split(':').collect();
                if parts.len() != 2 {
                    return Err(ErrorUnauthorized("Invalid API key format"));
                }
                let key = parts[0];
                let client = parts[1];

                let verified = verify_encrypted_key_for_client(key, client);
                if !verified {
                    return Err(ErrorUnauthorized("Invalid API key"));
                }

                Ok(User {
                    credentials: Some(UserCredentials {
                        api_key: key.to_string(),
                        user: client.to_string(),
                    }),
                })
            } else {
                Err(ErrorUnauthorized("Missing X-API-KEY  header"))
            }
        })
    }
}
