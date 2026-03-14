# Intelligent Hotel Booking System - Quick Reference

## 🚀 Quick Start Commands

### Development
```bash
npm run dev              # Start both frontend and backend
```

### Production Build & Deploy
```bash
./build.sh               # Build everything for production
./start.sh               # Start production server
```

### Docker Deployment
```bash
npm run docker:build     # Build Docker containers
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
npm run docker:logs      # View logs
```

### Alternative npm commands
```bash
npm run setup            # Same as ./build.sh
npm run start:prod       # Start production server
```

---

## 📁 Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `build.sh` | Automated build script | `./build.sh` |
| `start.sh` | Production server starter | `./start.sh` |
| `setup-and-build.sh` | Interactive setup with sample data | `./setup-and-build.sh` |

---

## 🌐 Access URLs (After Starting Server)

| Page | URL | Credentials |
|------|-----|-------------|
| **Frontend** | http://localhost:3000/intelligent-hotel-booking | - |
| **User Login** | http://localhost:3000/intelligent-hotel-booking/login | (your users) |
| **Hotel Owner Login** | http://localhost:3000/intelligent-hotel-booking/owner/login | (your owners) |
| **Admin Login** | http://localhost:3000/intelligent-hotel-booking/admin/login | admin@hotel.com / admin123 |
| **API** | http://localhost:3000/api | - |

---

## 🔑 Default Credentials

### Admin
- Email: `admin@hotel.com`
- Password: `admin123`

### Sample Users (if seeded)
- Email: `john@example.com`
- Password: `password123`

### Sample Hotel Owners (if seeded)
- Email: `owner1@hotel.com`
- Password: `password123`

---

## 📋 Build Script Features

### `./build.sh` does:
1. ✅ Checks prerequisites (Node.js, npm)
2. ✅ Creates `.env` files for frontend and backend
3. ✅ Installs all dependencies
4. ✅ Initializes admin user in database
5. ✅ Builds frontend for production
6. ✅ Copies frontend build to `backend/public/`
7. ✅ Configures backend to serve static files
8. ✅ Creates `start.sh` script

### `./setup-and-build.sh` does:
- Everything `build.sh` does, PLUS:
- Prompts to populate database with sample data
- Creates users, hotels, and bookings for testing

---

## 🛠️ Manual Commands

### Backend Only
```bash
cd backend
npm run dev              # Development mode
npm start                # Production mode
npm run init:admin       # Initialize admin user
npm run check:data       # Check database contents
```

### Frontend Only
```bash
cd frontend
npm run dev              # Development mode
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## 📦 Project Structure

```
intelligent-hotel-booking/
├── backend/
│   ├── public/              # Frontend build (after deployment)
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── scripts/         # Setup & seed scripts
│   └── .env                 # Backend config
│
├── frontend/
│   ├── dist/                # Production build
│   ├── src/
│   │   ├── Pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (auth)
│   │   └── lib/             # Utilities, API calls
│   └── .env                 # Frontend config
│
├── build.sh                 # Automated build script
├── start.sh                 # Production starter
├── setup-and-build.sh       # Interactive setup
└── package.json             # Root package config
```

---

## 🔧 Environment Variables

### Backend (`.env`)
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intelligent-hotel-booking
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

### Frontend (`.env`)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
```

---

## 🐛 Troubleshooting

### MongoDB not running?
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port 3000 in use?
```bash
lsof -i :3000
kill -9 <PID>
```

### Need to rebuild?
```bash
rm -rf frontend/dist backend/public
./build.sh
```

### Admin can't login?
```bash
cd backend
npm run init:admin
```

---

## 📚 Documentation Files

- `BUILD_AND_DEPLOY.md` - Detailed build and deployment guide
- `ADMIN_SETUP.md` - Admin portal setup and usage
- `README.md` - Project overview (if exists)

---

## 🎯 Common Workflows

### First Time Setup
```bash
./setup-and-build.sh    # Interactive setup with sample data
./start.sh              # Start server
```

### Daily Development
```bash
npm run dev             # Start dev servers
# Open http://localhost:5173
```

### Production Deployment
```bash
./build.sh              # Build for production
./start.sh              # Start production server
# Open http://localhost:3000
```

### Quick Admin Access
```bash
./build.sh              # If not built yet
./start.sh              # Start server
# Go to http://localhost:3000/admin/login
# Login: admin@hotel.com / admin123
```
