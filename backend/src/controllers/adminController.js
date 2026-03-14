const User = require("../models/User")
const HotelOwner = require("../models/HotelOwner")
const Booking = require("../models/Booking")

// Note: Hotels are stored in HotelOwner model (one hotel per owner)
const Hotel = HotelOwner

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await User.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    })
  }
}

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    })
  }
}

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    })
  }
}

/**
 * @desc    Get all hotels (hotel owners)
 * @route   GET /api/admin/hotels
 * @access  Private
 */
const getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query

    const query = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { hotelName: { $regex: search, $options: "i" } },
      ]
    }

    if (status === "verified") {
      query.isVerified = true
    } else if (status === "unverified") {
      query.isVerified = false
    }

    const hotels = await HotelOwner.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await HotelOwner.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        hotels: hotels.map((hotel) => ({
          id: hotel._id,
          name: hotel.name,
          email: hotel.email,
          phone: hotel.phone,
          hotelName: hotel.hotelName,
          hotelDescription: hotel.hotelDescription,
          city: hotel.city,
          state: hotel.state,
          isVerified: hotel.isVerified,
          onboardingComplete: hotel.onboardingComplete,
          createdAt: hotel.createdAt,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get all hotels error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotels",
      error: error.message,
    })
  }
}

/**
 * @desc    Get hotel by ID
 * @route   GET /api/admin/hotels/:id
 * @access  Private
 */
const getHotelById = async (req, res) => {
  try {
    const hotel = await HotelOwner.findById(req.params.id)
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    res.status(200).json({
      success: true,
      data: hotel,
    })
  } catch (error) {
    console.error("Get hotel by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel",
      error: error.message,
    })
  }
}

/**
 * @desc    Verify hotel
 * @route   PATCH /api/admin/hotels/:id/verify
 * @access  Private
 */
const verifyHotel = async (req, res) => {
  try {
    const hotel = await HotelOwner.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    )
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Hotel verified successfully",
      data: hotel,
    })
  } catch (error) {
    console.error("Verify hotel error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify hotel",
      error: error.message,
    })
  }
}

/**
 * @desc    Delete hotel
 * @route   DELETE /api/admin/hotels/:id
 * @access  Private
 */
const deleteHotel = async (req, res) => {
  try {
    const hotel = await HotelOwner.findByIdAndDelete(req.params.id)
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    })
  } catch (error) {
    console.error("Delete hotel error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete hotel",
      error: error.message,
    })
  }
}

/**
 * @desc    Get all bookings
 * @route   GET /api/admin/bookings
 * @access  Private
 */
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "" } = req.query

    const query = status ? { status } : {}

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("user", "name email")

    const count = await Booking.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        bookings: bookings.map((booking) => ({
          id: booking._id,
          bookingId: booking.bookingId,
          hotelName: booking.hotelName,
          roomType: booking.roomType,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          guests: booking.guests,
          totalAmount: booking.totalAmount,
          status: booking.status,
          user: booking.user,
          createdAt: booking.createdAt,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get all bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    })
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllHotels,
  getHotelById,
  verifyHotel,
  deleteHotel,
  getAllBookings,
}
