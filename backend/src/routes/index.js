const express = require("express")
const router = express.Router()

// Import auth routes
const authRoutes = require("./auth")
const ownerRoutes = require("./ownerRoutes")

router.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

// Auth routes
router.use("/auth", authRoutes)

// Hotel owner routes
router.use("/owner", ownerRoutes)

module.exports = router
