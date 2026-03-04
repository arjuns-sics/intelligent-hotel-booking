const jwt = require("jsonwebtoken")
const User = require("../models/User")

/**
 * Middleware to protect user routes
 * Verifies JWT token and attaches user ID to request
 */
const protectUser = async (req, res, next) => {
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

      // Get user from token (token uses userId, not id)
      const user = await User.findById(decoded.userId)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        })
      }

      // Attach user ID to request
      req.userId = user._id
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  } catch (error) {
    console.error("Protect user middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  protectUser,
}
