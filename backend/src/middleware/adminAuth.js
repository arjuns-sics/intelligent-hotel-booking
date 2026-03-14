const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

/**
 * Middleware to protect admin routes
 * Verifies JWT token and attaches admin ID to request
 */
const protectAdmin = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get admin from token
      const admin = await Admin.findById(decoded.id)

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found",
        })
      }

      // Attach admin ID to request
      req.adminId = admin._id
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  } catch (error) {
    console.error("Protect admin middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  protectAdmin,
}
