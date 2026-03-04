const express = require("express")
const router = express.Router()

// Import auth routes
const authRoutes = require("./auth")
const ownerRoutes = require("./ownerRoutes")
const hotelRoutes = require("./hotels")
const bookingRoutes = require("./bookings")

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

module.exports = router
