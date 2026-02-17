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

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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

// Error handling
app.use(notFound)
app.use(errorHandler)

module.exports = app