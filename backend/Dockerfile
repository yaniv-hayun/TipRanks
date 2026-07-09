# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production

# Copy built files and assets
COPY --from=builder /usr/src/app/dist ./dist

# Render sets PORT automatically
ENV PORT=9000
EXPOSE 9000

CMD ["node", "dist/main.js"]
