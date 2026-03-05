const express = require("express")
const router = express.Router()

// Import auth routes
const authRoutes = require("./auth")
const ownerRoutes = require("./ownerRoutes")
const hotelRoutes = require("./hotels")
const bookingRoutes = require("./bookings")
const reviewRoutes = require("./reviews")

router.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

// Auth routes
router.use("/auth", authRoutes)

// Hotel owner routes
router.use("/owner", ownerRoutes)

// Public hotel routes
router.use("/hotels", hotelRoutes)

// User booking routes (protected)
router.use("/bookings", bookingRoutes)

// Review routes
router.use("/reviews", reviewRoutes)

module.exports = router
