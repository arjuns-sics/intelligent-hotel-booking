# Docker Deployment Guide

## Overview

The Intelligent Hotel Booking System can be deployed using Docker with a multi-stage build that:
1. Builds the frontend automatically
2. Configures it with the correct base path
3. Serves it from the backend
4. Runs MongoDB as a separate container

## Quick Start

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access the Application

Once running:
- **Frontend:** http://localhost:3000/intelligent-hotel-booking
- **Admin Login:** http://localhost:3000/intelligent-hotel-booking/admin/login
- **API:** http://localhost:3000/api

**Default Admin Credentials:**
- Email: `admin@hotel.com`
- Password: `admin123`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────────┐  │
│  │   Backend        │         │   MongoDB            │  │
│  │   Container      │────────▶│   Container          │  │
│  │   (Node.js)      │         │   (mongo:7.0)        │  │
│  │                  │         │                      │  │
│  │  - API Server    │         │  - Database          │  │
│  │  - Frontend      │         │  - No port exposed   │  │
│  │    (static)      │         │  - Internal only     │  │
│  └────────┬─────────┘         └──────────────────────┘  │
│           │                                              │
└───────────┼──────────────────────────────────────────────┘
            │
            ▼
    http://localhost:3000
```

## Services

### Backend (`backend`)
- **Image:** Built from `Dockerfile`
- **Port:** 3000 (exposed to host)
- **Environment:**
  - `PORT=3000`
  - `MONGODB_URI` (auto-configured)
  - `NODE_ENV=production`
  - `JWT_SECRET` (customizable)
- **Features:**
  - Multi-stage build (builds frontend)
  - Auto-initializes admin user
  - Health checks
  - Non-root user for security

### MongoDB (`mongo`)
- **Image:** `mongo:7.0`
- **Port:** Not exposed to host (internal only)
- **Volumes:**
  - `mongodb_data` - Database storage
  - `mongodb_config` - Configuration
- **Security:**
  - Username: `admin`
  - Password: `admin123`
  - Only accessible within Docker network

## Commands

### Start Services
```bash
# Build and start
docker-compose up -d --build

# Start without rebuild
docker-compose up -d
```

### Stop Services
```bash
# Stop gracefully
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongo
```

### Access Containers
```bash
# Backend shell
docker exec -it hotel-booking-backend sh

# MongoDB shell
docker exec -it hotel-booking-mongo mongosh -u admin -p admin123
```

### Health Check
```bash
# Check backend health
curl http://localhost:3000/api/

# Check container status
docker-compose ps
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Custom JWT Secret (recommended)
JWT_SECRET=your-super-secret-key-here

# MongoDB credentials (optional - defaults shown)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123
```

### Custom Port

To use a different port, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8080:3000"  # Host port 8080, container port 3000
```

Then access at: `http://localhost:8080/intelligent-hotel-booking`

## Data Persistence

Data is stored in Docker volumes:
- `hotel-booking-mongodb-data` - Database files
- `hotel-booking-mongodb-config` - MongoDB config

These volumes persist even when containers are stopped.

### Backup Database

```bash
# Create backup directory
mkdir -p ./backups

# Export database
docker exec hotel-booking-mongo mongodump --out /tmp/backup -u admin -p admin123

# Copy to host
docker cp hotel-booking-mongo:/tmp/backup ./backups/mongodb-backup

# Restore
docker cp ./backups/mongodb-backup hotel-booking-mongo:/tmp/restore
docker exec hotel-booking-mongo mongorestore /tmp/restore -u admin -p admin123
```

## Troubleshooting

### Backend Won't Start

Check logs:
```bash
docker-compose logs backend
```

Common issues:
- MongoDB not ready: Wait for health check to pass
- Port in use: Change host port in docker-compose.yml
- JWT_SECRET not set: Create .env file

### Can't Access Frontend

1. Check backend is running:
   ```bash
   docker-compose ps
   ```

2. Check logs:
   ```bash
   docker-compose logs backend
   ```

3. Test API:
   ```bash
   curl http://localhost:3000/api/
   ```

### Database Connection Issues

1. Check MongoDB health:
   ```bash
   docker-compose logs mongo
   ```

2. Test connection from backend:
   ```bash
   docker exec hotel-booking-backend ping mongo
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

## Production Deployment

### Security Recommendations

1. **Change Default Credentials:**
   ```bash
   # In .env file
   MONGO_INITDB_ROOT_PASSWORD=strong-password
   JWT_SECRET=very-long-random-string
   ```

2. **Use Specific Image Versions:**
   ```yaml
   mongo: mongo:7.0.14  # Pin to specific version
   ```

3. **Add Resource Limits:**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 1G
   ```

4. **Enable HTTPS:**
   Use a reverse proxy (Nginx, Traefik) with SSL certificates

5. **Network Security:**
   ```yaml
   networks:
     hotel-network:
       driver: bridge
       ipam:
         config:
           - subnet: 172.20.0.0/16
   ```

### Example with Nginx Reverse Proxy

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

  backend:
    # ... backend config ...
```

## Build Details

### Multi-Stage Build

The `Dockerfile` uses two stages:

**Stage 1: Frontend Builder**
- Uses Node.js 20 Alpine
- Installs frontend dependencies
- Builds with Vite
- Configures base path `/intelligent-hotel-booking`

**Stage 2: Backend Runtime**
- Uses Node.js 20 Alpine
- Installs production dependencies only
- Copies frontend build from Stage 1
- Sets up non-root user
- Configures health checks
- Uses dumb-init for proper signal handling

### Image Size

Approximate sizes:
- Final image: ~200MB
- Frontend build: ~1MB
- Backend dependencies: ~50MB

## Monitoring

### Container Stats
```bash
docker stats hotel-booking-backend hotel-booking-mongo
```

### Database Stats
```bash
docker exec hotel-booking-mongo mongosh -u admin -p admin123 --eval "db.stats()"
```

### Application Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Updates

### Update Application

```bash
# Pull latest code (if using git)
git pull

# Rebuild and restart
docker-compose up -d --build --force-recreate
```

### Update MongoDB

```bash
# Backup first
docker exec hotel-booking-mongo mongodump --out /tmp/backup -u admin -p admin123

# Update image
docker-compose pull mongo

# Recreate container
docker-compose up -d mongo
```
