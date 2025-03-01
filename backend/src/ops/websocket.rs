use super::auth::verify_encrypted_key_for_client;
use actix_ws::{CloseCode, CloseReason, Session};
use bytestring::ByteString;

pub fn authenticate_connection(token: ByteString) -> bool {
    let parts: Vec<&str> = token.split(':').collect();

    verify_encrypted_key_for_client(parts[0], parts[1])
}
pub async fn close_session(session: &Session) {
    session
        .clone()
        .close(Some(CloseReason {
            description: Some("Internal error".to_string()),
            code: CloseCode::Normal,
        }))
        .await
        .unwrap();
}
