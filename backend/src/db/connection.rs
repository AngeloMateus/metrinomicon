use rusqlite::Connection;

pub fn connect_db(db_path: &str) -> Connection {
    //Open a new connection to database. If a database does not exist at the path, one is created.
    let conn = match Connection::open(db_path) {
        Ok(conn) => conn,
        Err(err) => panic!("Error opening database: {:?}", err),
    };
    conn.pragma_update(None, "journal_mode", "WAL")
        .expect("Failed to run in WAL mode");
    conn.pragma_update(None, "locking_mode", "NORMAL")
        .expect("Failed to run in WAL mode");

    //Requests TABLE
    match conn.execute_batch(
        "
        BEGIN TRANSACTION;
        CREATE TABLE IF NOT EXISTS requests(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            endpoint      TEXT NOT NULL,
            params   TEXT NOT NULL,
            method   TEXT NOT NULL,
            req_headers  TEXT NOT NULL,
            res_headers  TEXT NOT NULL,
            status   TEXT,
            req_body TEXT,
            res_body TEXT,
            res_time INTEGER
        );
        CREATE TABLE IF NOT EXISTS uptime_settings(
            url	TEXT PRIMARY KEY NOT NULL,
            interval INT DEFAULT 60,
            method	 TEXT DEFAULT 'GET',
            enabled  INTEGER DEFAULT 1,
            name     TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS uptime(
            timestamp	DATETIME PRIMARY KEY,
            status      TEXT,
            url         TEXT
        );
        COMMIT;
        ",
    ) {
        Ok(_) => (),
        Err(err) => {
            if cfg!(debug_assertions) {
                println!("{:#?}", err)
            }
        }
    }

    conn
}
