# Build & Deployment Scripts

This document explains the automated build and deployment scripts for the Intelligent Hotel Booking System.

## Quick Start

### Automated Build (Recommended)

Run the automated build script to configure, build, and deploy everything:

```bash
./build.sh
```

This will:
1. ✅ Configure environment files (`.env` for frontend and backend)
2. ✅ Install all dependencies
3. ✅ Initialize the admin user
4. ✅ Build the frontend for production
5. ✅ Deploy frontend to backend's `public/` directory
6. ✅ Configure backend to serve static files
7. ✅ Create a convenient start script

### Start the Production Server

After building:

```bash
./start.sh
```

Or using npm:

```bash
npm run setup    # Run the build script
npm run start:prod  # Start production server
```

## Manual Build Steps

If you prefer to run steps manually:

### 1. Configure Environment

**Backend** (`backend/.env`):
```bash
PORT=3000
MONGODB_URI=mongodb://localhost:27017/intelligent-hotel-booking
NODE_ENV=production
JWT_SECRET=your-secret-key-here
```

**Frontend** (`frontend/.env`):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_PREFIX=/api
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Initialize Admin

```bash
cd backend
npm run init:admin
```

### 4. Build Frontend

```bash
npm run build
```

### 5. Deploy Frontend to Backend

```bash
# From project root
rm -rf backend/public
cp -r frontend/dist backend/public
```

### 6. Update Backend to Serve Static Files

The backend's `src/index.js` should include:

```javascript
const path = require("path")

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.join(__dirname, "../public")
  app.use(express.static(publicPath))
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"))
  })
}
```

### 7. Start Production Server

```bash
cd backend
NODE_ENV=production npm start
```

## Script Files

### `build.sh`
Automated non-interactive build script. Best for:
- CI/CD pipelines
- Automated deployments
- Quick setup without prompts

**Usage:**
```bash
./build.sh
```

### `setup-and-build.sh`
Interactive setup script with sample data population. Best for:
- Development environments
- Testing with sample data
- First-time setup with demo content

**Usage:**
```bash
./setup-and-build.sh
```

### `start.sh`
Convenient production start script. Checks MongoDB and starts the server.

**Usage:**
```bash
./start.sh
```

## Directory Structure After Build

```
intelligent-hotel-booking/
├── backend/
│   ├── public/              # Frontend build (copied from frontend/dist)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── src/
│   │   ├── index.js         # Updated to serve static files
│   │   └── ...
│   ├── .env                 # Backend configuration
│   └── package.json
├── frontend/
│   ├── dist/                # Production build
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── .env                 # Frontend configuration
│   └── package.json
├── build.sh                 # Automated build script
├── start.sh                 # Production start script
├── setup-and-build.sh       # Interactive setup script
└── package.json
```

## Access Points After Deployment

Once the production server is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000/intelligent-hotel-booking | - |
| Admin Login | http://localhost:3000/intelligent-hotel-booking/admin/login | admin@hotel.com / admin123 |
| API | http://localhost:3000/api | - |
| User Login | http://localhost:3000/intelligent-hotel-booking/login | (created users) |
| Hotel Owner Login | http://localhost:3000/intelligent-hotel-booking/owner/login | (created owners) |

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/...` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Secret for JWT tokens | (auto-generated) |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:3000` |
| `VITE_API_PREFIX` | API path prefix | `/api` |

## Troubleshooting

### MongoDB Not Running

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Manual
mongod --config /usr/local/etc/mongod.conf
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Build Fails

```bash
# Clean and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
rm -rf frontend/dist backend/public
npm run install:all
./build.sh
```

### Frontend Can't Connect to Backend

1. Check `frontend/.env` has correct `VITE_API_BASE_URL`
2. Ensure backend is running on the specified port
3. Check CORS settings in `backend/src/index.js`

## Production Deployment

For production deployment to a server:

1. **Build locally or on server:**
   ```bash
   ./build.sh
   ```

2. **Set production environment variables:**
   - Use a secure `JWT_SECRET`
   - Configure MongoDB connection for production
   - Set proper CORS origins

3. **Use a process manager (PM2 recommended):**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/index.js --name hotel-booking
   pm2 save
   pm2 startup
   ```

4. **Configure reverse proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Security Notes

- ✅ Change default admin credentials after first login
- ✅ Use strong, randomly generated `JWT_SECRET`
- ✅ Enable HTTPS in production
- ✅ Set secure CORS origins
- ✅ Use environment variables for secrets
- ✅ Don't commit `.env` files to version control
