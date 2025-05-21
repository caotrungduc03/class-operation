FROM node:18-alpine AS production

WORKDIR /app

COPY apps/web/package.json ./
RUN yarn install --production --frozen-lockfile --network-timeout 600000 && \
    yarn cache clean && \
    rm -rf /app/.yarn/cache

