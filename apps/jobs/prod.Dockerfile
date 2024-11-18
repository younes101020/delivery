FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY ./src ./src
COPY ./package.json ./tsconfig.json ./drizzle.config.ts ./

RUN yarn install --ignore-optional --frozen-lockfile && \
    yarn build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

RUN chown -R hono:nodejs /app

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=builder --chown=hono:nodejs /app/src/db/migrations /app/src/db/migrations


USER hono
EXPOSE 3090

CMD node /app/dist/src/db/migrate.js && node /app/dist/src/index.js
