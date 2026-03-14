const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const routes = require("./routes")
const { errorHandler, notFound } = require("./middleware/errorHandler")
const { swaggerUi, specs, swaggerOptions } = require("./config/swagger")

const app = express()

// // Security middleware
// app.use(helmet({
//   hsts: false,

// }))

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
    credentials: true,
  })
)

// Body parser with increased limit for image uploads (10MB)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Status of the server
 *                 message:
 *                   type: string
 *                   description: Health check message
 *                 timestamp:
 *                   type: string
 *                   description: Current timestamp
 */
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running successfully",
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use("/api", routes)

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions))

// Serve static frontend files in production
if (process.env.NODE_ENV === "production") {
  const path = require("path")
  const publicPath = path.join(__dirname, "../public")
  app.use(express.static(publicPath))
  
  // SPA fallback - serve index.html for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/api-docs')) {
      res.sendFile(path.join(publicPath, "index.html"))
    } else {
      next()
    }
  })
}

// Error handling
app.use(notFound)
app.use(errorHandler)

module.exports = app