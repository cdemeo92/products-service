#!/bin/sh
set -e
docker build -t products-service .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --user root products-service test:all