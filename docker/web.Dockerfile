# Build stage
FROM caotrungduc/base-build AS builder

COPY eslint.config.mjs ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY .env ./

COPY apps/web ./apps/web

RUN npx nx build web --prod

# Production stage
FROM caotrungduc/base-deploy-fe AS production

WORKDIR /app

COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public

ARG WEB_PORT=3000
EXPOSE $WEB_PORT

# Start the Next.js app
CMD ["yarn", "start"]

