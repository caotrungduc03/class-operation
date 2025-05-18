# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 600000

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .env ./

COPY apps/web ./apps/web

RUN npx nx build web --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json

RUN yarn install --production --frozen-lockfile --non-interactive --network-timeout 600000 && \
    yarn cache clean && \
    rm -rf /app/.yarn/cache

ARG WEB_PORT=3000
EXPOSE $WEB_PORT

# Start the Next.js app
CMD ["yarn", "start"]

