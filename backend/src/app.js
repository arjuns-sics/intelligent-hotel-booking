const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const routes = require("./routes")
const { errorHandler, notFound } = require("./middleware/errorHandler")

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
    credentials: true,
  })
)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// API routes
app.use("/api", routes)

// Error handling
app.use(notFound)
app.use(errorHandler)

module.exports = app