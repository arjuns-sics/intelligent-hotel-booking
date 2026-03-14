const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const User = require("../models/User")
const HotelOwner = require("../models/HotelOwner")
const Booking = require("../models/Booking")

// Note: Hotels are stored in HotelOwner model (one hotel per owner)
const Hotel = HotelOwner

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

/**
 * @desc    Initialize admin (create if not exists)
 * @route   POST /api/admin/init
 * @access  Public (should be called once during setup)
 */
const initializeAdmin = async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@hotel.com" })
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      })
    }

    // Create admin with hardcoded credentials
    const admin = await Admin.create({
      name: "System Administrator",
      email: "admin@hotel.com",
      password: "admin123", // Will be hashed by pre-save hook
      role: "super-admin",
    })

    res.status(201).json({
      success: true,
      message: "Admin initialized successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Initialize admin error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to initialize admin",
      error: error.message,
    })
  }
}

/**
 * @desc    Login admin
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    // Find admin
    const admin = await Admin.findOne({ email }).select("+password")
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Check password
    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    // Generate token
    const token = generateToken(admin._id)

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    })
  }
}

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private
 */
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password")
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      })
    }

    res.status(200).json({
      success: true,
      data: admin,
    })
  } catch (error) {
    console.error("Get admin profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    })
  }
}

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    console.log("Fetching admin stats...")
    
    // Get counts
    const totalUsers = await User.countDocuments()
    const totalHotels = await HotelOwner.countDocuments({ onboardingComplete: true })
    const totalBookings = await Booking.countDocuments()
    const totalOwners = await HotelOwner.countDocuments()

    console.log("Stats:", { totalUsers, totalHotels, totalBookings, totalOwners })

    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .select("bookingId hotelName roomType checkIn checkOut status totalAmount createdAt")

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Calculate revenue (sum of confirmed/completed bookings)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["confirmed", "checked-in", "checked-out"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ])

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0

    res.status(200).json({
      success: true,
      data: {
        users: totalUsers,
        hotels: totalHotels,
        bookings: totalBookings,
        owners: totalOwners,
        revenue: totalRevenue,
        recentBookings,
        bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    })
  }
}

module.exports = {
  initializeAdmin,
  loginAdmin,
  getAdminProfile,
  getDashboardStats,
}
