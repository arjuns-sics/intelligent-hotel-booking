const jwt = require("jsonwebtoken")
const HotelOwner = require("../models/HotelOwner")

/**
 * Middleware to protect hotel owner routes
 * Verifies JWT token and attaches owner ID to request
 */
const protectOwner = async (req, res, next) => {
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

      // Get owner from token
      const owner = await HotelOwner.findById(decoded.id)

      if (!owner) {
        return res.status(401).json({
          success: false,
          message: "Owner not found",
        })
      }

      // Attach owner ID to request
      req.ownerId = owner._id
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  } catch (error) {
    console.error("Protect owner middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

module.exports = {
  protectOwner,
}
