use actix::MailboxError;
use anyhow::{anyhow, Result};
use log::info;
use std::{error::Error, fmt::Debug};

pub fn print_debug_error<T: Error>(e: T) {
    if cfg!(debug_assertions) {
        eprintln!("{:#?}", e);
    }
}

pub fn debug<T: Debug>(e: T) {
    if cfg!(debug_assertions) {
        println!("{:#?}", e);
    }
}
