# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .env ./

COPY apps/co ./apps/co
COPY libs ./libs

RUN npx nx build co --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/co ./
COPY --from=builder /app/dist/libs ./libs
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock* ./

RUN yarn install --production --frozen-lockfile --non-interactive --network-timeout 600000

ARG CO_PORT=8080
EXPOSE $CO_PORT

CMD ["node", "main.js"]
