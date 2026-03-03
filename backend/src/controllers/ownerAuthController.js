const jwt = require("jsonwebtoken")
const HotelOwner = require("../models/HotelOwner")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

/**
 * @desc    Register a new hotel owner
 * @route   POST /api/owner/register
 * @access  Public
 */
const registerOwner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      })
    }

    // Check if owner already exists
    const existingOwner = await HotelOwner.findOne({ email })
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      })
    }

    // Create hotel owner
    const owner = await HotelOwner.create({
      name,
      email,
      phone,
      password,
    })

    // Generate token
    const token = generateToken(owner._id)

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        onboardingComplete: owner.onboardingComplete,
        token,
      },
    })
  } catch (error) {
    console.error("Register owner error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    })
  }
}

/**
 * @desc    Login hotel owner
 * @route   POST /api/owner/login
 * @access  Public
 */
const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      })
    }

    // Find owner with password field
    const owner = await HotelOwner.findOne({ email }).select("+password")
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check password
    const isPasswordValid = await owner.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Generate token
    const token = generateToken(owner._id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        onboardingComplete: owner.onboardingComplete,
        token,
      },
    })
  } catch (error) {
    console.error("Login owner error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    })
  }
}

/**
 * @desc    Get current hotel owner profile
 * @route   GET /api/owner/profile
 * @access  Private
 */
const getOwnerProfile = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.ownerId)

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        isVerified: owner.isVerified,
        onboardingComplete: owner.onboardingComplete,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    })
  }
}

/**
 * @desc    Mark onboarding as complete
 * @route   PATCH /api/owner/onboarding/complete
 * @access  Private
 */
const completeOnboarding = async (req, res) => {
  try {
    const {
      hotelName,
      hotelDescription,
      address,
      city,
      state,
      pincode,
      website,
      amenities,
      rooms,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
    } = req.body

    const updateData = {
      onboardingComplete: true,
      hotelName,
      hotelDescription,
      address,
      city,
      state,
      pincode,
      website,
      amenities,
      rooms,
      checkInTime,
      checkOutTime,
      cancellationPolicy,
      petPolicy,
    }

    const owner = await HotelOwner.findByIdAndUpdate(
      req.ownerId,
      updateData,
      { new: true }
    )

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Onboarding completed",
      data: {
        onboardingComplete: true,
        hotelName: owner.hotelName,
        hotelDescription: owner.hotelDescription,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        amenities: owner.amenities,
        rooms: owner.rooms,
      },
    })
  } catch (error) {
    console.error("Complete onboarding error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to complete onboarding",
      error: error.message,
    })
  }
}

module.exports = {
  registerOwner,
  loginOwner,
  getOwnerProfile,
  completeOnboarding,
}
