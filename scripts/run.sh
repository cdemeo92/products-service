#!/bin/sh
set -e
docker compose build app
docker compose up -d db
echo "Waiting for MySQL to be ready..."
sleep 15
docker compose up app
