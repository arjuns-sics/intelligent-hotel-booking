#!/bin/bash

# =============================================================================
# Intelligent Hotel Booking System - Automated Build Script
# =============================================================================
# Non-interactive version - suitable for CI/CD or automated deployments
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    echo -e "\n${BLUE}=============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================================================${NC}\n"
}

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Check prerequisites
print_header "Checking Prerequisites"
command -v node >/dev/null 2>&1 || { print_error "Node.js is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is required"; exit 1; }
print_success "Node.js $(node -v) and npm $(npm -v) found"

# Configure environment files
print_header "Configuring Environment"

# Backend .env
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    cat > "$PROJECT_ROOT/backend/.env" << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intelligent-hotel-booking
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "production-jwt-secret-$(date +%s)")
EOF
    print_success "Backend .env created"
fi

# Frontend .env
if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    cat > "$PROJECT_ROOT/frontend/.env" << EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
EOF
    print_success "Frontend .env created"
fi

# Update vite.config.ts with base path
print_info "Configuring frontend base path..."
sed -i.bak "s|base:.*|base: '/intelligent-hotel-booking/',|" "$PROJECT_ROOT/frontend/vite.config.ts"
rm -f "$PROJECT_ROOT/frontend/vite.config.ts.bak" 2>/dev/null || true
print_success "Frontend base path configured"

# Install dependencies
print_header "Installing Dependencies"
cd "$PROJECT_ROOT"
npm install --prefer-offline --no-audit --silent 2>/dev/null || npm install
cd "$PROJECT_ROOT/backend" && npm install --prefer-offline --no-audit --silent 2>/dev/null || npm install
cd "$PROJECT_ROOT/frontend" && npm install --prefer-offline --no-audit --silent 2>/dev/null || npm install
print_success "Dependencies installed"

# Initialize admin
print_header "Initializing Admin User"
cd "$PROJECT_ROOT/backend"
npm run init:admin 2>/dev/null || print_info "Admin may already exist"

# Build frontend
print_header "Building Frontend"
cd "$PROJECT_ROOT/frontend"
npx vite build
print_success "Frontend built to dist/"

# Copy frontend to backend
print_header "Deploying Frontend to Backend"
rm -rf "$PROJECT_ROOT/backend/public"
cp -r "$PROJECT_ROOT/frontend/dist" "$PROJECT_ROOT/backend/public"
print_success "Frontend deployed to backend/public"

# Update backend index.js
print_header "Configuring Backend Static Serving"
cat > "$PROJECT_ROOT/backend/src/index.js" << 'EOF'
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")
require("dotenv").config()

const app = require("./app")

const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true,
}))

// API routes
app.use("/api", require("./routes"))

// Serve static frontend files in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "../public")
  app.use(express.static(publicPath))
  
  // Serve index.html for all non-API routes (SPA support)
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏨  Intelligent Hotel Booking System                    ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || "development"}                              ║
║                                                           ║
║   Frontend: http://localhost:${PORT}                         ║
║   API: http://localhost:${PORT}/api                          ║
║                                                           ║
║   Admin Login: http://localhost:${PORT}/admin/login          ║
║   Email: admin@hotel.com                                   ║
║   Password: admin123                                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `)
})
EOF
print_success "Backend configured"

# Create start script
cat > "$PROJECT_ROOT/start.sh" << 'EOF'
#!/bin/bash
set -e
cd "$(dirname "${BASH_SOURCE[0]}")/backend"
export NODE_ENV=production

if ! pgrep -x "mongod" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running. Please start it first."
    exit 1
fi

npm start
EOF
chmod +x "$PROJECT_ROOT/start.sh"

print_header "Build Complete! 🎉"
echo -e "${GREEN}To start the server:${NC}"
echo "  $PROJECT_ROOT/start.sh"
echo ""
echo -e "${GREEN}Or manually:${NC}"
echo "  cd $PROJECT_ROOT/backend"
echo "  NODE_ENV=production npm start"
echo ""
echo -e "${GREEN}Access:${NC} http://localhost:3000"
echo -e "${GREEN}Admin:${NC} admin@hotel.com / admin123"
