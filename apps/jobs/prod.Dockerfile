FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache gcompat
WORKDIR /app

COPY package*.json tsconfig.json src ./
RUN mkdir -p ./var/ssh/keys

RUN npm install && \
    npm run build && \
    npm install --production --ignore-scripts

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/var /app/var

USER hono
EXPOSE 3090

CMD ["node", "/app/dist/index.js"]