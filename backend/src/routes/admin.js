const express = require("express")
const router = express.Router()
const {
  initializeAdmin,
  loginAdmin,
  getAdminProfile,
  getDashboardStats,
} = require("../controllers/adminAuthController")
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllHotels,
  getHotelById,
  verifyHotel,
  deleteHotel,
  getAllBookings,
} = require("../controllers/adminController")
const { protectAdmin } = require("../middleware/adminAuth")

// Public routes
router.post("/init", initializeAdmin)
router.post("/login", loginAdmin)

// Protected routes
router.get("/profile", protectAdmin, getAdminProfile)
router.get("/stats", protectAdmin, getDashboardStats)

// User management routes
router.get("/users", protectAdmin, getAllUsers)
router.get("/users/:id", protectAdmin, getUserById)
router.delete("/users/:id", protectAdmin, deleteUser)

// Hotel management routes
router.get("/hotels", protectAdmin, getAllHotels)
router.get("/hotels/:id", protectAdmin, getHotelById)
router.patch("/hotels/:id/verify", protectAdmin, verifyHotel)
router.delete("/hotels/:id", protectAdmin, deleteHotel)

// Booking management routes
router.get("/bookings", protectAdmin, getAllBookings)

module.exports = router
