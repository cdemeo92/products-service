#!/bin/sh
set -e
docker compose build app
docker compose run --rm app test:all
