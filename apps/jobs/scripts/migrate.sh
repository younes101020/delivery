#!/bin/sh
set -e

# add the current user to the docker group if it exists
DOCKER_GID=${DOCKER_GID:-998}
if ! getent group docker > /dev/null 2>&1; then
  addgroup -g "$DOCKER_GID" docker
fi
addgroup hono docker || true

# run sql migrations
pnpm -C /app/packages/drizzle run migrate

# run the application
node /app/apps/jobs/dist/src/index.js