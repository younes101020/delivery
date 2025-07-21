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
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache su-exec
RUN apk add --no-cache chromium

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
RUN adduser hono nodejs
RUN chown -R hono:nodejs /app

COPY --from=installer --chown=hono:nodejs /app .

RUN chmod +x /app/apps/jobs/scripts/init.sh

EXPOSE 3090

ENTRYPOINT ["/app/apps/jobs/scripts/init.sh"]
