start:
	docker compose --env-file backend/.env up

default-keygen:
	@c=$$(docker ps --filter "ancestor=metrinomicon_be" --format "{{.ID}}" | head -n 1); \
	if [ -z "$$c" ]; then \
		echo "No container found"; \
	else \
		docker exec -t $$c /bin/bash -c "./metrinomicon --keygen admin null"; \
	fi
