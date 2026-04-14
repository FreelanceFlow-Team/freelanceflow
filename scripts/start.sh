#!/bin/sh
set -e

echo "=== Waiting for database ==="
MAX_RETRIES=30
RETRY=0
until npx prisma db push --skip-generate --accept-data-loss 2>&1; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "ERROR: Failed to sync database after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Database not ready (attempt $RETRY/$MAX_RETRIES), retrying in 2s..."
  sleep 2
done
echo "=== Database synced ==="

echo "=== Starting server ==="
exec node dist/main
