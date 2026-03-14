# =============================================================================
# Intelligent Hotel Booking System - Backend Dockerfile
# =============================================================================
# Multi-stage build:
#   Stage 1: Build frontend
#   Stage 2: Setup backend with frontend build
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy frontend source
COPY frontend/ ./

# Configure base path and build
RUN sed -i "s|base:.*|base: '/intelligent-hotel-booking/',|" vite.config.ts

# Build frontend
RUN npm run build --silent

# -----------------------------------------------------------------------------
# Stage 2: Backend Production Image
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production --silent

# Copy backend source
COPY backend/src/ ./src/

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/dist ./public

# Create .env file with production defaults
# Use $RANDOM for JWT secret if openssl not available
RUN sh -c 'echo "PORT=3000" > .env && \
    echo "MONGODB_URI=mongodb://mongo:27017/intelligent-hotel-booking" >> .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET:-hotel-booking-secret-$(date +%s)-$RANDOM}" >> .env'

# Create directories for scripts
RUN mkdir -p src/scripts

# Copy initialization scripts
COPY backend/src/scripts/ ./src/scripts/

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/ || exit 1

# Initialize admin and start server
CMD ["sh", "-c", "node src/scripts/initAdmin.js 2>/dev/null || true && dumb-init node src/index.js"]
