const express = require("express")
const router = express.Router()

// Import auth routes
const authRoutes = require("./auth")

router.get("/", (req, res) => {
  res.json({ message: "API is running" })
})

// Auth routes
router.use("/auth", authRoutes)

module.exports = router
