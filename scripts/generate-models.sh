#!/bin/sh
cd "$(dirname "$0")/.."

dotenv -e .env -- sh -c 'npx stg -D mysql \
  -h "$MYSQL_HOST" \
  -p "$MYSQL_PORT" \
  -d "$MYSQL_DATABASE" \
  -u "$MYSQL_USER" \
  -x "$MYSQL_PASSWORD" \
  -o src/infrastructure/repositories/models \
  --case camel \
  -i -m \
  -T SequelizeMeta \
  --clean'
