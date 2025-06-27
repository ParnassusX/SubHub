# Multi-stage build for SubHub

# Frontend build stage
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ .
RUN npm run build

# Production stage
FROM alpine:latest
RUN apk add --no-cache ca-certificates

# Create app directory
WORKDIR /app

# Copy PocketBase binary
COPY backend/pocketbase ./pocketbase
RUN chmod +x ./pocketbase

# Copy frontend build
COPY --from=frontend-build /app/dist ./public

# Create data directory
RUN mkdir -p /app/pb_data

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

# Start PocketBase with public directory
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data", "--publicDir=/app/public"]
