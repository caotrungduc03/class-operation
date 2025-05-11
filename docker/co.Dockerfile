# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy all project files
COPY . .

# Build the CO app using Nx
RUN npx nx build co --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Use the CO_PORT from environment
ARG CO_PORT=8081
ENV PORT=$CO_PORT

# Copy built app from the builder stage
COPY --from=builder /app/dist/apps/co ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock* ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile --non-interactive

# Expose the port (will use the PORT env variable)
EXPOSE $PORT

CMD ["node", "main.js"]
