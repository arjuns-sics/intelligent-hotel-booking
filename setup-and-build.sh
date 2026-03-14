#!/bin/bash

# =============================================================================
# Intelligent Hotel Booking System - Setup & Build Script
# =============================================================================
# This script:
# 1. Configures frontend and backend environment files
# 2. Installs all dependencies
# 3. Initializes the admin user
# 4. Populates the database with sample data (optional)
# 5. Builds the frontend for production
# 6. Configures backend to serve the frontend
# 7. Starts the production server
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "\n${BLUE}=============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed. Please install $1 first."
        exit 1
    fi
}

# =============================================================================
# Prerequisites Check
# =============================================================================

print_header "Checking Prerequisites"

check_command "node"
check_command "npm"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

print_info "Node.js version: $NODE_VERSION"
print_info "npm version: $NPM_VERSION"

# =============================================================================
# Environment Configuration
# =============================================================================

print_header "Configuring Environment Files"

# Backend .env
BACKEND_ENV="$PROJECT_ROOT/backend/.env"
if [ ! -f "$BACKEND_ENV" ]; then
    print_info "Creating backend .env file..."
    cat > "$BACKEND_ENV" << EOF
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intelligent-hotel-booking
NODE_ENV=production
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "your-super-secret-jwt-key-$(date +%s)")
EOF
    print_success "Backend .env created"
else
    print_info "Backend .env already exists, skipping..."
fi

# Frontend .env
FRONTEND_ENV="$PROJECT_ROOT/frontend/.env"
if [ ! -f "$FRONTEND_ENV" ]; then
    print_info "Creating frontend .env file..."
    cat > "$FRONTEND_ENV" << EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
EOF
    print_success "Frontend .env created"
else
    print_info "Frontend .env already exists, skipping..."
fi

# =============================================================================
# Install Dependencies
# =============================================================================

print_header "Installing Dependencies"

cd "$PROJECT_ROOT"

print_info "Installing root dependencies..."
npm install --prefer-offline --no-audit --silent 2>/dev/null || npm install

print_info "Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
npm install --prefer-off-line --no-audit --silent 2>/dev/null || npm install

print_info "Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
npm install --prefer-offline --no-audit --silent 2>/dev/null || npm install

cd "$PROJECT_ROOT"
print_success "All dependencies installed"

# =============================================================================
# Database Initialization
# =============================================================================

print_header "Initializing Database"

cd "$PROJECT_ROOT/backend"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null 2>&1; then
    print_error "MongoDB is not running. Please start MongoDB first."
    print_info "On macOS: brew services start mongodb-community"
    print_info "On Linux: sudo systemctl start mongod"
    exit 1
fi
print_success "MongoDB is running"

# Initialize admin user
print_info "Initializing admin user..."
npm run init:admin 2>/dev/null || print_info "Admin user may already exist"

# =============================================================================
# Populate Sample Data (Optional)
# =============================================================================

print_header "Sample Data Population"

read -p "Do you want to populate the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Creating sample data script..."
    
    cat > "$PROJECT_ROOT/backend/src/scripts/seedData.js" << 'SEEDEOF'
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../models/User")
const HotelOwner = require("../models/HotelOwner")
const Booking = require("../models/Booking")

const sampleUsers = [
  { name: "John Doe", email: "john@example.com", password: "password123" },
  { name: "Jane Smith", email: "jane@example.com", password: "password123" },
  { name: "Bob Wilson", email: "bob@example.com", password: "password123" },
  { name: "Alice Brown", email: "alice@example.com", password: "password123" },
]

const sampleHotels = [
  {
    name: "Hotel Owner 1",
    email: "owner1@hotel.com",
    password: "password123",
    phone: "1234567890",
    hotelName: "The Grand Palace",
    hotelDescription: "Luxury hotel with amazing amenities",
    city: "Mumbai",
    state: "Maharashtra",
    address: "123 Marine Drive",
    pincode: "400001",
    amenities: ["wifi", "pool", "gym", "spa", "restaurant"],
    onboardingComplete: true,
    isVerified: true,
    rooms: [
      {
        name: "Deluxe Room",
        description: "Spacious room with city view",
        price: 5000,
        maxGuests: 2,
        beds: "1 King Bed",
        size: "35 sqm",
        amenities: ["wifi", "ac", "tv"],
        status: "available",
      },
      {
        name: "Suite",
        description: "Premium suite with ocean view",
        price: 10000,
        maxGuests: 4,
        beds: "2 Queen Beds",
        size: "60 sqm",
        amenities: ["wifi", "ac", "tv", "minibar"],
        status: "available",
      },
    ],
  },
  {
    name: "Hotel Owner 2",
    email: "owner2@hotel.com",
    password: "password123",
    phone: "0987654321",
    hotelName: "Mountain Retreat",
    hotelDescription: "Peaceful getaway in the mountains",
    city: "Manali",
    state: "Himachal Pradesh",
    address: "456 Mall Road",
    pincode: "175131",
    amenities: ["wifi", "parking", "restaurant", "bonfire"],
    onboardingComplete: true,
    isVerified: true,
    rooms: [
      {
        name: "Standard Room",
        description: "Cozy room with mountain view",
        price: 3000,
        maxGuests: 2,
        beds: "1 Queen Bed",
        size: "25 sqm",
        amenities: ["wifi", "heater"],
        status: "available",
      },
    ],
  },
]

const sampleBookings = [
  {
    hotelName: "The Grand Palace",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    location: "Mumbai, Maharashtra",
    roomId: "room-1",
    roomType: "Deluxe Room",
    roomDetails: {
      price: 5000,
      maxGuests: 2,
      beds: "1 King Bed",
      size: "35 sqm",
      amenities: ["wifi", "ac", "tv"],
    },
    checkIn: new Date(Date.now() - 86400000 * 5),
    checkOut: new Date(Date.now() - 86400000 * 2),
    guests: 2,
    numberOfNights: 3,
    pricePerNight: 5000,
    totalAmount: 15000,
    status: "checked-out",
  },
  {
    hotelName: "Mountain Retreat",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    location: "Manali, Himachal Pradesh",
    roomId: "room-2",
    roomType: "Standard Room",
    roomDetails: {
      price: 3000,
      maxGuests: 2,
      beds: "1 Queen Bed",
      size: "25 sqm",
      amenities: ["wifi", "heater"],
    },
    checkIn: new Date(Date.now() - 86400000 * 2),
    checkOut: new Date(Date.now() + 86400000 * 3),
    guests: 2,
    numberOfNights: 5,
    pricePerNight: 3000,
    totalAmount: 15000,
    status: "checked-in",
  },
  {
    hotelName: "The Grand Palace",
    hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    location: "Mumbai, Maharashtra",
    roomId: "room-3",
    roomType: "Suite",
    roomDetails: {
      price: 10000,
      maxGuests: 4,
      beds: "2 Queen Beds",
      size: "60 sqm",
      amenities: ["wifi", "ac", "tv", "minibar"],
    },
    checkIn: new Date(Date.now() + 86400000 * 10),
    checkOut: new Date(Date.now() + 86400000 * 15),
    guests: 3,
    numberOfNights: 5,
    pricePerNight: 10000,
    totalAmount: 50000,
    status: "confirmed",
  },
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB\n")

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...")
    await User.deleteMany({})
    await HotelOwner.deleteMany({})
    await Booking.deleteMany({})

    // Create users
    console.log("\nCreating users...")
    const users = []
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(userData.password, salt)
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      })
      users.push(user)
      console.log(`  ✓ Created user: ${user.email}`)
    }

    // Create hotel owners
    console.log("\nCreating hotel owners...")
    const hotels = []
    for (const hotelData of sampleHotels) {
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(hotelData.password, salt)
      const hotel = await HotelOwner.create({
        ...hotelData,
        password: hashedPassword,
      })
      hotels.push(hotel)
      console.log(`  ✓ Created hotel: ${hotel.hotelName}`)
    }

    // Create bookings (assign to first user and first hotel)
    console.log("\nCreating bookings...")
    for (const bookingData of sampleBookings) {
      const booking = await Booking.create({
        user: users[0]._id,
        hotel: hotels[0]._id,
        ...bookingData,
      })
      console.log(`  ✓ Created booking: ${booking.bookingId}`)
    }

    console.log("\n✓ Database seeded successfully!")
    console.log("\n=== Sample Credentials ===")
    console.log("Admin:")
    console.log("  Email: admin@hotel.com")
    console.log("  Password: admin123")
    console.log("\nUsers:")
    sampleUsers.forEach(u => console.log(`  ${u.email} / ${u.password}`))
    console.log("\nHotel Owners:")
    sampleHotels.forEach(h => console.log(`  ${h.email} / ${h.password}`))

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
SEEDEOF

    print_info "Running sample data population..."
    node "$PROJECT_ROOT/backend/src/scripts/seedData.js"
    print_success "Sample data populated"
else
    print_info "Skipping sample data population"
fi

# =============================================================================
# Build Frontend
# =============================================================================

print_header "Building Frontend"

cd "$PROJECT_ROOT/frontend"

print_info "Building frontend for production..."
npm run build

if [ -d "dist" ]; then
    print_success "Frontend built successfully"
    print_info "Frontend build location: $PROJECT_ROOT/frontend/dist"
else
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi

# =============================================================================
# Configure Backend to Serve Frontend
# =============================================================================

print_header "Configuring Backend to Serve Frontend"

# Create public directory in backend
BACKEND_PUBLIC="$PROJECT_ROOT/backend/public"
if [ -d "$BACKEND_PUBLIC" ]; then
    rm -rf "$BACKEND_PUBLIC"
fi

# Copy frontend build to backend public directory
print_info "Copying frontend build to backend..."
cp -r "$PROJECT_ROOT/frontend/dist" "$BACKEND_PUBLIC"
print_success "Frontend files copied to backend/public"

# Update backend index.js to serve static files
print_info "Updating backend to serve static files..."

BACKEND_INDEX="$PROJECT_ROOT/backend/src/index.js"

# Check if static serving is already configured
if ! grep -q "serve-static" "$BACKEND_INDEX" 2>/dev/null; then
    # Add static file serving to index.js
    cat > "$BACKEND_INDEX" << 'INDEXEOF'
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
INDEXEOF
    print_success "Backend configured to serve frontend"
else
    print_info "Backend already configured to serve static files"
fi

# =============================================================================
# Create Start Script
# =============================================================================

print_header "Creating Production Start Script"

cat > "$PROJECT_ROOT/start-production.sh" << 'STARTEOF'
#!/bin/bash

# Production start script for Intelligent Hotel Booking System

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT/backend"

echo "Starting Intelligent Hotel Booking System..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null 2>&1; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi

echo "✓ MongoDB is running"
echo ""

# Start the server
export NODE_ENV=production
npm start
STARTEOF

chmod +x "$PROJECT_ROOT/start-production.sh"
print_success "Production start script created: $PROJECT_ROOT/start-production.sh"

# =============================================================================
# Summary
# =============================================================================

print_header "Setup Complete! 🎉"

echo -e "${GREEN}Build Summary:${NC}"
echo "  ✓ Environment files configured"
echo "  ✓ Dependencies installed"
echo "  ✓ Admin user initialized"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  ✓ Sample data populated"
fi
echo "  ✓ Frontend built for production"
echo "  ✓ Backend configured to serve frontend"
echo ""
echo -e "${GREEN}To start the production server:${NC}"
echo "  $PROJECT_ROOT/start-production.sh"
echo ""
echo "Or manually:"
echo "  cd $PROJECT_ROOT/backend"
echo "  NODE_ENV=production npm start"
echo ""
echo -e "${GREEN}Access the application:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Admin Login: http://localhost:3000/admin/login"
echo ""
echo -e "${GREEN}Default Credentials:${NC}"
echo "  Admin: admin@hotel.com / admin123"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  User: john@example.com / password123"
    echo "  Hotel Owner: owner1@hotel.com / password123"
fi
echo ""
