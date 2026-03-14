# Admin Portal Setup Guide

## Overview
The Admin Portal provides a comprehensive dashboard for managing users, hotels, and bookings in the Intelligent Hotel Booking system.

## Admin Credentials (Hardcoded for Demo)
- **Email:** `admin@hotel.com`
- **Password:** `admin123`

## Quick Setup (Automated)

The easiest way to set up everything is using the automated build script:

```bash
# Build and configure everything
./build.sh

# Start the production server
./start.sh
```

This will:
1. Configure environment files
2. Install dependencies
3. Initialize the admin user
4. Build the frontend
5. Deploy the frontend to the backend
6. Start the server

Access the admin portal at: `http://localhost:3000/admin/login`

## Manual Setup

### 1. Initialize Admin User
Before using the admin portal, you need to initialize the admin user in the database. You can do this by calling the initialization endpoint once:

```bash
curl -X POST http://localhost:3000/api/admin/init
```

Or using the provided script:

```bash
# From the project root directory
node backend/src/scripts/initAdmin.js
```

**Note:** The admin user is created with hashed password using bcryptjs.

### 2. Start the Backend
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

## Frontend Setup

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 2. Access Admin Portal
Navigate to: `http://localhost:5173/admin/login`

## API Endpoints

### Authentication
- `POST /api/admin/init` - Initialize admin user (one-time setup)
- `POST /api/admin/login` - Login admin
- `GET /api/admin/profile` - Get admin profile (protected)

### Dashboard Stats
- `GET /api/admin/stats` - Get dashboard statistics (protected)

### User Management
- `GET /api/admin/users?page=1&limit=10&search=` - Get all users (protected)
- `GET /api/admin/users/:id` - Get user by ID (protected)
- `DELETE /api/admin/users/:id` - Delete user (protected)

### Hotel Management
- `GET /api/admin/hotels?page=1&limit=10&search=&status=` - Get all hotels (protected)
- `GET /api/admin/hotels/:id` - Get hotel by ID (protected)
- `PATCH /api/admin/hotels/:id/verify` - Verify hotel (protected)
- `DELETE /api/admin/hotels/:id` - Delete hotel (protected)

### Booking Management
- `GET /api/admin/bookings?page=1&limit=10&status=` - Get all bookings (protected)

## Features

### Admin Dashboard Overview
- **Total Users:** Count of registered users
- **Total Hotels:** Count of active hotels
- **Total Bookings:** Count of all bookings
- **Total Revenue:** Sum of confirmed/completed bookings
- **Bookings by Status:** Visual breakdown of bookings
- **Recent Bookings:** Table of latest bookings

### User Management
- View all registered users
- Search users by name or email
- Delete users
- Pagination support

### Hotel Management
- View all registered hotels
- Search hotels by name, owner, or location
- Verify/unverify hotels
- Delete hotels
- View hotel onboarding status
- Pagination support

### Booking Management
- View all bookings across the platform
- Filter by status
- View booking details including guest information
- Pagination support

## Security Notes

1. **Change Default Credentials:** In production, change the hardcoded admin credentials
2. **Environment Variables:** Store the admin credentials in environment variables
3. **JWT Secret:** Ensure `JWT_SECRET` is set to a strong, random value in production
4. **HTTPS:** Always use HTTPS in production to protect credentials
5. **Rate Limiting:** Consider adding rate limiting to the login endpoint

## File Structure

### Backend
```
backend/src/
├── models/
│   └── Admin.js              # Admin model schema
├── controllers/
│   ├── adminAuthController.js # Admin authentication logic
│   └── adminController.js     # Admin management logic
├── middleware/
│   └── adminAuth.js          # Admin authentication middleware
└── routes/
    └── admin.js              # Admin routes
```

### Frontend
```
frontend/src/
├── Pages/
│   ├── AdminLoginPage.tsx    # Admin login page
│   └── AdminDashboard.tsx    # Admin dashboard
├── context/
│   └── AdminAuthProvider.tsx # Admin auth context
├── lib/
│   ├── adminAuthAtom.ts      # Admin auth state management
│   └── api.ts                # Admin API helpers
└── components/ui/
    └── table.tsx             # Table component
```

## Troubleshooting

### Admin Login Fails
1. Ensure the admin user is initialized
2. Check MongoDB connection
3. Verify JWT_SECRET is set in .env

### Dashboard Shows No Data
1. Ensure there is data in the database
2. Check that the admin token is valid
3. Verify API endpoints are accessible

### TypeScript Errors
The admin-specific code is type-safe. Pre-existing errors in other files don't affect admin functionality.
