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
RUN turbo prune @delivery/drizzle --docker

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
RUN pnpm turbo build --filter=@delivery/drizzle

FROM base AS runner
WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages/drizzle/node_modules ./packages/drizzle/node_modules
COPY --from=installer /app/packages/drizzle/src ./packages/drizzle/src
COPY --from=installer /app/package.json ./package.json
COPY --from=installer /app/packages/drizzle/package.json ./packages/drizzle/package.json
COPY --from=installer /app/packages/drizzle/drizzle.config.ts ./packages/drizzle/drizzle.config.ts
COPY --from=installer /app/turbo.json ./turbo.json
COPY --from=installer /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

CMD ["turbo", "migrate"]
