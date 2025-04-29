FROM node:23-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN yarn global add turbo@^2.3.3
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @delivery/jobs --docker

# First install the dependencies (as they change less often)
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN yarn install

# Build the project
COPY --from=builder /app/out/full/ .
RUN yarn turbo run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN chown -R hono:nodejs /app

COPY --from=installer --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/dist ./apps/jobs/dist
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/package.json ./apps/jobs/package.json
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/drizzle.config.ts ./apps/jobs/drizzle.config.ts
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/src/db/migrations ./apps/jobs/src/db/migrations


USER hono
EXPOSE 3090

CMD node apps/jobs/dist/src/db/migrate.js && node apps/jobs/dist/src/index.js
