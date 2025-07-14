#!/bin/sh
pnpm -C /app/packages/drizzle run migrate
node /app/apps/jobs/dist/src/index.js