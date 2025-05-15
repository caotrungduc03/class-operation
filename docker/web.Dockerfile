# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Sao chép package.json và yarn.lock
COPY package.json yarn.lock ./

# Cài đặt các phụ thuộc bằng Yarn
RUN yarn install --frozen-lockfile --network-timeout 600000

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .env ./

COPY apps/web ./apps/web

# Build the web app using Nx
RUN npx nx build web --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Copy built app from the builder stage
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json

# Install production dependencies only
RUN yarn install --production --frozen-lockfile --non-interactive --network-timeout 600000 && \
    yarn cache clean && \
    rm -rf /app/.yarn/cache

# Expose the port
EXPOSE 3000

# Start the Next.js app
CMD ["yarn", "start"]

