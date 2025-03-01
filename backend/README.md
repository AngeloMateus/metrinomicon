# Table of Contents
1. [Intro](#Metrinomicon)
2. [Server](#Server)
3. [Frontend](#Frontend)

# Metrinomicon

A simple observability tool for your backend API.

## Use cases

- Logging and storing requests
- Monitoring API performance and error rates
- Tracking API usage

# Server

## Setup
First create an .env in the same directory as the metrinomicon executable. Add to following variables:

```
SECRET_KEY=
API_PORT=
API_IP=
DB_PATH=
```

## Running
To run the server:

`
$ metrinomicon
`

## Authentication
The server runs with authentication by default. To skip authentication set `--no-auth` flag:

To require API key authentication (used for every API call) generate keys via the cli:

`
$ metrinomicon --keygen username description
`

This will generate a key using the secret key set in .env.

To verify a key:

`
$ metrinomicon --verify key
`

## Requests

Log requests from your backend's middleware by calling the endpoint set in .env variables API_IP and API_PORT

## Example:

```bash
$ curl --location 'localhost:8082/append-request' \
  --header 'Content-Type: application/json' \
  --header 'X-API-KEY: ••••••' \
  --data '{
    "method": "GET",
    "url": "https://myapi.example.com",
    "req_headers": "captured request headers",
    "res_headers": "captured response headers",
    "date": "2025-02-01T00:00:00.000Z",
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

# Frontend

## Setup
Create a .env file in the root directory of the project executable. Add to following variable where API_IP and API_PORT are the same as above:

```
NEXT_PUBLIC_API=http://API_IP:API_PORT
```


## Running with Docker

Build the image:
```
$ docker build -t metrinomicon .
```

Then run the container:
```
$ docker run -p 3000:3000 metrinomicon
```

## Running with yarn

```
$ yarn
$ yarn dev
```

If authentication is set, login with the username and API key, otherwise any credentials will work.
