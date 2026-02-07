#!/bin/sh
set -e
docker compose build
docker compose run --rm app test:all
