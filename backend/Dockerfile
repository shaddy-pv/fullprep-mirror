# =============================================
# Backend Dockerfile - Production Ready
# =============================================
# Multi-stage build for optimized image size

# Stage 1: Base
FROM node:18-alpine AS base
LABEL maintainer="Shadan - DevOps Engineer"
LABEL project="FullPrep Backend"

# Install security updates
RUN apk update && apk upgrade

# Stage 2: Dependencies
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 3: Build
FROM base AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Stage 4: Production
FROM base AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
