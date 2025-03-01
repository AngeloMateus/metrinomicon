# Use the official Rust image as the base
FROM rust:latest AS builder

# Set the working directory
WORKDIR /app/

RUN addgroup --system --gid 1001 rust
RUN adduser --system --uid 1001 rustuser

COPY . .
RUN cargo build --release
# Remove every file except the binary
RUN mv ./target/release/metrinomicon /tmp/metrinomicon && rm -rf ./* && mv /tmp/metrinomicon .

RUN chown rustuser:rust ./metrinomicon
RUN chown rustuser:rust ./

EXPOSE $API_PORT
ENV args=

CMD ["sh","-c","./metrinomicon ${args}"]
