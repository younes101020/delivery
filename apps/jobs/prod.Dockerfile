FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

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

RUN yarn global add pnpm
RUN yarn global add turbo

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build --filter=@delivery/jobs

FROM installer AS migration
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/jobs/node_modules ./apps/jobs/node_modules

COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/apps/jobs/package.json ./apps/jobs/package.json

COPY --from=installer /app/apps/jobs/tsconfig.build.json ./apps/jobs/tsconfig.build.json
COPY --from=installer /app/apps/jobs/drizzle.config.ts ./apps/jobs/drizzle.config.ts
COPY --from=installer /app/apps/jobs/src/db/migrations ./apps/jobs/src/db/migrations
COPY --from=installer /app/apps/jobs/src/db/schema.ts ./apps/jobs/src/db/schema.ts

RUN pnpm db:migrate

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN adduser hono nodejs
RUN chown -R hono:nodejs /app

COPY --from=installer --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/node_modules ./apps/jobs/node_modules
COPY --from=installer --chown=hono:nodejs /app/apps/jobs/dist ./apps/jobs/dist

USER hono
EXPOSE 3090

CMD ["node", "apps/jobs/dist/src/index.js"]
