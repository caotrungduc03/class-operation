# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .env ./

COPY apps/noti ./apps/noti
COPY libs ./libs

RUN npx nx build noti --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/noti ./
COPY --from=builder /app/dist/libs ./libs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock* ./

RUN yarn install --production --frozen-lockfile --non-interactive --network-timeout 600000 && \
    yarn cache clean && \
    rm -rf /app/.yarn/cache
  
ARG NOTI_PORT=8081
ARG SOCKET_PORT=8082
EXPOSE $NOTI_PORT
EXPOSE $SOCKET_PORT

CMD ["node", "main.js"]
