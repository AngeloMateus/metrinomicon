include .env

dev:
	cargo run -- --no-auth

docker-build:
	docker build -t metrinomicon_be .

docker-run:
	docker run -p "${API_PORT}:${API_PORT}" metrinomicon_be

docker-run-no-auth:
	docker run -p "${API_PORT}:${API_PORT}" -e args=--no-auth metrinomicon_be

default-keygen:
	@c=$$(docker ps --filter "ancestor=metrinomicon_be" --format "{{.ID}}" | head -n 1); \
	if [ -z "$$c" ]; then \
		echo "No container found"; \
	else \
		docker exec -t $$c /bin/bash -c "./metrinomicon --keygen admin null"; \
	fi
