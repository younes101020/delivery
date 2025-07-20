#!/bin/sh
set -e

# add the runtime user to the docker group if it exists
DOCKER_GID=${DOCKER_GID:-998}
if ! getent group docker > /dev/null 2>&1; then
  addgroup -g "$DOCKER_GID" docker
fi
addgroup hono docker || true

# run sql migrations
pnpm -C /app/packages/drizzle run migrate

# start the application as the runtime user
exec su-exec hono sh -c "exec node /app/apps/jobs/dist/src/index.js"