#!/bin/sh
set -e
cp .env.dev .env
docker compose build
docker compose up -d
