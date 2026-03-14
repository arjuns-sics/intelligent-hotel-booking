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