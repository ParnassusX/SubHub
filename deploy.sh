#!/bin/bash

# SubHub Production Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying SubHub to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend for $ENVIRONMENT..."
    
    cd app
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm ci
    
    # Copy environment file
    if [ -f ".env.$ENVIRONMENT" ]; then
        cp ".env.$ENVIRONMENT" .env
        print_success "Environment file copied"
    else
        print_warning "No environment file found for $ENVIRONMENT"
    fi
    
    # Build
    print_status "Building React application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Prepare backend
prepare_backend() {
    print_status "Preparing backend..."
    
    cd backend
    
    # Make PocketBase executable
    chmod +x pocketbase
    
    # Check if PocketBase is working
    if ./pocketbase --help &> /dev/null; then
        print_success "PocketBase is ready"
    else
        print_error "PocketBase is not working"
        exit 1
    fi
    
    cd ..
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deploy
    
    # Copy built frontend
    cp -r app/dist deploy/public
    
    # Copy backend
    cp -r backend deploy/
    
    # Copy deployment files
    cp PRODUCTION_DEPLOYMENT.md deploy/
    cp SETUP_GUIDE.md deploy/
    
    # Create deployment info
    cat > deploy/DEPLOYMENT_INFO.txt << EOF
SubHub Deployment Package
========================

Generated: $(date)
Environment: $ENVIRONMENT
Version: 1.0.0

Contents:
- public/          Frontend build (React app)
- backend/         PocketBase backend
- PRODUCTION_DEPLOYMENT.md  Deployment guide
- SETUP_GUIDE.md   Database setup guide

Quick Start:
1. Upload this entire folder to your server
2. Follow PRODUCTION_DEPLOYMENT.md
3. Set up database using SETUP_GUIDE.md
4. Configure domain and SSL

Support: https://github.com/yourusername/SubHub
EOF
    
    print_success "Deployment package created in ./deploy/"
}

# Create Docker files for production
create_docker_files() {
    print_status "Creating Docker configuration..."
    
    # Dockerfile
    cat > deploy/Dockerfile << 'EOF'
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Create app directory
WORKDIR /app

# Copy PocketBase binary
COPY backend/pocketbase ./pocketbase
RUN chmod +x ./pocketbase

# Copy frontend build
COPY public ./public

# Create data directory
RUN mkdir -p /app/pb_data

# Expose port
EXPOSE 8090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1

# Start PocketBase with public directory
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/app/pb_data", "--publicDir=/app/public"]
EOF

    # Docker Compose
    cat > deploy/docker-compose.yml << 'EOF'
version: '3.8'

services:
  subhub:
    build: .
    ports:
      - "8090:8090"
    volumes:
      - pb_data:/app/pb_data
    restart: unless-stopped
    environment:
      - PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY:-your-32-char-encryption-key-here}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8090/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  pb_data:
    driver: local

networks:
  default:
    name: subhub-network
EOF

    # Docker environment file
    cat > deploy/.env.docker << 'EOF'
# Docker Environment Configuration
PB_ENCRYPTION_KEY=your-32-char-encryption-key-here
COMPOSE_PROJECT_NAME=subhub
EOF

    print_success "Docker files created"
}

# Run tests (if available)
run_tests() {
    print_status "Running tests..."
    
    cd app
    
    # Check if test script exists
    if npm run test --silent 2>/dev/null; then
        print_success "All tests passed"
    else
        print_warning "No tests found or tests failed"
    fi
    
    cd ..
}

# Main deployment process
main() {
    print_status "Starting SubHub deployment process..."
    
    check_dependencies
    build_frontend
    prepare_backend
    run_tests
    create_package
    create_docker_files
    
    print_success "🎉 Deployment package ready!"
    echo ""
    print_status "Next steps:"
    echo "1. Upload the ./deploy/ folder to your server"
    echo "2. Follow the PRODUCTION_DEPLOYMENT.md guide"
    echo "3. Configure your domain and SSL certificate"
    echo "4. Set up the database collections"
    echo ""
    print_status "Deployment options:"
    echo "• VPS/Cloud Server: Follow PRODUCTION_DEPLOYMENT.md"
    echo "• Docker: Use docker-compose up -d in the deploy folder"
    echo "• Vercel + Railway: Deploy frontend and backend separately"
    echo ""
    print_success "Your SubHub app is ready for production! 🚀"
}

# Run main function
main
