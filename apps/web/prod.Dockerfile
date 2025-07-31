FROM node:23-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

RUN yarn global add turbo@^2.3.3
COPY . .
RUN turbo prune @delivery/web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN yarn global add pnpm
RUN yarn global add turbo

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .

ARG AUTH_SECRET
ENV AUTH_SECRET=${AUTH_SECRET}
ARG JOBS_BEARER_TOKEN
ENV JOBS_BEARER_TOKEN=${JOBS_BEARER_TOKEN}
ARG JOBS_API_BASEURL
ENV JOBS_API_BASEURL=${JOBS_API_BASEURL}
ARG WEB_BASE_URL
ENV WEB_BASE_URL=${WEB_BASE_URL}

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm turbo build --filter=@delivery/web

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD ["node", "apps/web/server.js"]