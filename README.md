# Table of Contents
1. [Intro](#Metrinomicon)
2. [Running](#Running)
    - [With Docker compose and Make](#With-Docker-compose-and-Make)
    - [With Yarn and Cargo](#With-Yarn-and-Cargo)
4. [Authentication](#Authentication)
5. [Requests](#Requests)

# Metrinomicon

A simple observability tool for your backend API.

## Use cases

- Logging and storing requests
- Monitoring API performance and error rates
- Tracking API usage

![Dashboard](/assets/dashboard.png?raw=true)


![Requests](/assets/requests.png?raw=true)


![Uptime](/assets/uptime.png?raw=true)

## Running

Create an `.env` file in the `backend/` directory with the following contents:

```
API_IP=backend_ip
API_PORT=backend_port
DB_PATH=./db_name.db
SECRET_KEY=your_secret_key_here
```

The secret key is used when generating and verifying API keys for users.

Create an `.env` file in the `frontend/` directory with the following contents:

```
NEXT_PUBLIC_API=http://backend_ip:backend_port
```

### With Docker compose and Make

To start the project:

```
make start
```

Then generate a default admin API key by running the following command:

```
make default-keygen
```

Login to the webapp at http://localhost:3000 with the generated credentials.

### With Yarn and Cargo

To start the frontend:

```
yarn &&\
yarn build &&\
cp -r public .next/standalone/ &&\
cp -r .next/static .next/standalone/.next/&& \
node .next/standalone/server.js
```

Then generate a default admin API key and run the server:

```
cargo build --release && ./target/release/metrinomicon --keygen admin "Default admin key" && ./target/release/metrinomicon
```

## Authentication
The server requires authentication by default. To skip authentication set `--no-auth` flag:

To require API key authentication (used for every API call) generate keys via the cli:

`
$ ./metrinomicon --keygen username description
`

This will generate a key using the secret key set in .env.

## Requests

Log requests from your backend's middleware by calling `/append-request`

### Curl example:

```bash
$ curl --location 'localhost:8082/append-request' \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: test_key' \
  --data '{
    "method": "GET",
    "url": "https://myapi.example.com",
    "req_headers": "captured request headers",
    "res_headers": "captured response headers",
    "date": "2025-01-01T00:00:00.000Z",
    "status": 200,
    "req_body": {
        "testReqData": [
            "testData"
        ]
    },
    "res_body": {
        "testResData": 0
    },
    "res_time": 50
}'
```
