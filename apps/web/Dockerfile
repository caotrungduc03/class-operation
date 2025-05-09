# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Copy all project files
COPY . .

# Build the web app using Nx
RUN npx nx build web --prod

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Set NODE_ENV
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Copy built app from the builder stage
COPY --from=builder /app/dist/apps/web ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock* ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile --non-interactive

# Expose the port
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]
