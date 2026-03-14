const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")

require("dotenv").config()

const app = require("./app")
const connectDB = require("./config/database")

// app.set("trust proxy", 1)

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

connectDB().then(() => {
  // Serve static frontend files in production
  if (process.env.NODE_ENV === "production") {
    const publicPath = path.join(__dirname, "../public")
    
    // Serve static files from /intelligent-hotel-booking base path
    app.use('/intelligent-hotel-booking', express.static(publicPath))
    
    // Redirect root to base path for SPA
    app.get("/", (req, res) => {
      res.redirect("/intelligent-hotel-booking")
    })
    
    // Serve index.html for all non-API routes under base path (SPA support)
    // Express 5.x requires named parameters in routes
    app.get("/intelligent-hotel-booking/:path(*)", (req, res) => {
      res.sendFile(path.join(publicPath, "index.html"))
    })
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏨  Intelligent Hotel Booking System                    ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || "development"}                              ║
║                                                           ║
${process.env.NODE_ENV === "production" ? `║   Frontend: http://localhost:${PORT}/intelligent-hotel-booking   ║` : `║   API: http://localhost:${PORT}/api                          ║`}
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `)
  })
})