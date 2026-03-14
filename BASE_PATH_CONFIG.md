# Base Path Configuration

The frontend is configured to be served from the base path `/intelligent-hotel-booking`.

## Configuration Files

### 1. `frontend/vite.config.ts`
```typescript
export default defineConfig({
  base: '/intelligent-hotel-booking/',
  // ... rest of config
})
```

This tells Vite to:
- Prefix all asset URLs with `/intelligent-hotel-booking/`
- Generate HTML with correct paths to JS/CSS bundles
- Handle client-side routing with the base path

### 2. `backend/src/index.js`
```javascript
// Serve static files from /intelligent-hotel-booking
app.use('/intelligent-hotel-booking', express.static(publicPath))

// Redirect root to base path
app.get("/", (req, res) => {
  res.redirect("/intelligent-hotel-booking")
})

// Handle SPA routing under base path
app.get("/intelligent-hotel-booking/*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"))
})
```

This configures the backend to:
- Serve static assets from the `/intelligent-hotel-booking` path
- Redirect `/` to `/intelligent-hotel-booking`
- Handle client-side routing by serving `index.html` for all SPA routes

## Access URLs

After starting the production server:

- **Frontend Home:** http://localhost:3000/intelligent-hotel-booking
- **Admin Login:** http://localhost:3000/intelligent-hotel-booking/admin/login
- **User Login:** http://localhost:3000/intelligent-hotel-booking/login
- **Hotel Owner Login:** http://localhost:3000/intelligent-hotel-booking/owner/login
- **API:** http://localhost:3000/api (no change - API routes are separate)

## Why Use a Base Path?

Using a base path is useful when:
1. **Deploying to subdirectories** (e.g., GitHub Pages)
2. **Behind a reverse proxy** that uses path-based routing
3. **Multiple apps** served from the same domain
4. **Organization preference** for URL structure

## Changing the Base Path

To use a different base path:

### 1. Update `frontend/vite.config.ts`
```typescript
base: '/your-new-path/',
```

### 2. Update `backend/src/index.js`
```javascript
app.use('/your-new-path', express.static(publicPath))
app.get("/your-new-path/*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"))
})
```

### 3. Rebuild the frontend
```bash
cd frontend
npx vite build
```

### 4. Copy to backend
```bash
rm -rf backend/public
cp -r frontend/dist backend/public
```

## Build Script

The `build.sh` script automatically configures the base path:

```bash
./build.sh
```

This will:
1. Update `vite.config.ts` with the correct base path
2. Build the frontend
3. Deploy to backend
4. Configure backend routing

## Troubleshooting

### Assets not loading (404 errors)
- Check that `vite.config.ts` has the correct `base` setting
- Rebuild the frontend after changing the base path
- Verify the backend static path matches the base path

### Routes not working (page refresh shows 404)
- Ensure backend has the catch-all route: `app.get("/intelligent-hotel-booking/*", ...)`
- Check that the SPA fallback serves `index.html`

### API calls failing
- API routes should NOT include the base path
- API calls should go to `/api/...` not `/intelligent-hotel-booking/api/...`
- Check `frontend/.env` has correct `VITE_API_BASE_URL` and `VITE_API_PREFIX`
