const Booking = require("../models/Booking")
const HotelOwner = require("../models/HotelOwner")
const Review = require("../models/Review")
const { logActivity } = require("../middleware/activityLogger")

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (User)
 */
const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      roomType,
      roomDetails,
      checkIn,
      checkOut,
      guests,
      pricePerNight,
      specialRequests,
    } = req.body

    // Validation
    if (!hotelId || !roomId || !roomType || !checkIn || !checkOut || !guests || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details",
      })
    }

    // Verify hotel exists and has the room
    const hotel = await HotelOwner.findById(hotelId)
    if (!hotel || !hotel.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    // Find the room in hotel's rooms array
    const room = hotel.rooms.id(roomId)
    if (!room || room.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Selected room is not available",
      })
    }

    // Calculate number of nights
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

    if (numberOfNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      })
    }

    // Calculate total amount
    const totalAmount = pricePerNight * numberOfNights

    // Build location string
    const locationParts = []
    if (hotel.city) locationParts.push(hotel.city)
    if (hotel.state) locationParts.push(hotel.state)
    const location = locationParts.join(", ") || hotel.address || "India"

    // Create booking
    const booking = await Booking.create({
      user: req.userId,
      hotel: hotelId,
      hotelName: hotel.hotelName,
      hotelImage: hotel.hotelImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
      location,
      roomId,
      roomType,
      roomDetails: roomDetails || {
        price: room.price,
        maxGuests: room.maxGuests,
        beds: room.beds,
        size: room.size,
        amenities: room.amenities,
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      numberOfNights,
      pricePerNight,
      totalAmount,
      status: "confirmed",
      cancellationPolicy: hotel.cancellationPolicy || "flexible",
      specialRequests: specialRequests || "",
    })

    // Populate user details
    const populatedBooking = await Booking.findById(booking._id).populate("user", "name email")

    // Log activity
    await logActivity({
      action: 'booking_created',
      description: `New booking created for ${hotel.hotelName} by ${req.user?.name || 'Guest'}`,
      entityType: 'booking',
      entityId: booking._id,
      metadata: {
        bookingId: booking.bookingId,
        hotelName: hotel.hotelName,
        checkIn,
        checkOut,
        totalAmount,
      },
      user: req.user,
      owner: { _id: hotel._id },
    })

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: populatedBooking._id,
        bookingId: populatedBooking.bookingId,
        hotelName: populatedBooking.hotelName,
        hotelImage: populatedBooking.hotelImage,
        location: populatedBooking.location,
        roomType: populatedBooking.roomType,
        checkIn: populatedBooking.checkIn,
        checkOut: populatedBooking.checkOut,
        guests: populatedBooking.guests,
        numberOfNights: populatedBooking.numberOfNights,
        pricePerNight: populatedBooking.pricePerNight,
        totalAmount: populatedBooking.totalAmount,
        status: populatedBooking.status,
        bookingDate: populatedBooking.createdAt,
      },
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    })
  }
}

/**
 * @desc    Get all bookings for current user
 * @route   GET /api/bookings
 * @access  Private (User)
 */
const getUserBookings = async (req, res) => {
  try {
    const { status } = req.query

    // Build query
    const query = { user: req.userId }
    if (status && status !== "all") {
      query.status = status
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")

    // Transform bookings
    const transformedBookings = bookings.map((booking) => ({
      id: booking._id,
      bookingId: booking.bookingId,
      hotelName: booking.hotelName,
      hotelImage: booking.hotelImage,
      location: booking.location,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      numberOfNights: booking.numberOfNights,
      pricePerNight: booking.pricePerNight,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingDate: booking.createdAt,
      hotelId: booking.hotel.toString(),
    }))

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: {
        bookings: transformedBookings,
        count: transformedBookings.length,
      },
    })
  } catch (error) {
    console.error("Get user bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
      error: error.message,
    })
  }
}

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private (User)
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.userId,
    }).populate("user", "name email")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: {
        id: booking._id,
        bookingId: booking.bookingId,
        hotelName: booking.hotelName,
        hotelImage: booking.hotelImage,
        location: booking.location,
        roomType: booking.roomType,
        roomId: booking.roomId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guests: booking.guests,
        numberOfNights: booking.numberOfNights,
        pricePerNight: booking.pricePerNight,
        totalAmount: booking.totalAmount,
        status: booking.status,
        cancellationPolicy: booking.cancellationPolicy,
        specialRequests: booking.specialRequests,
        bookingDate: booking.createdAt,
        hotelId: booking.hotel.toString(),
      },
    })
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve booking",
      error: error.message,
    })
  }
}

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/bookings/:id
 * @access  Private (User)
 */
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.userId,
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      })
    }

    if (booking.status === "checked-out") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed booking",
      })
    }

    // Update booking status
    booking.status = "cancelled"
    await booking.save()

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
      },
    })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    })
  }
}

/**
 * @desc    Get bookings for hotel owner (to view incoming bookings)
 * @route   GET /api/owner/bookings
 * @access  Private (Hotel Owner)
 */
const getHotelBookings = async (req, res) => {
  try {
    const { status } = req.query

    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    const hotelId = owner._id.toString()

    // Build query
    const query = { hotel: hotelId }
    if (status && status !== "all") {
      query.status = status
    }

    const bookings = await Booking.find(query)
      .sort({ checkIn: -1 })
      .populate("user", "name email phone")

    // Transform bookings
    const transformedBookings = bookings.map((booking) => ({
      id: booking._id,
      bookingId: booking.bookingId,
      hotelName: booking.hotelName,
      hotelImage: booking.hotelImage,
      location: booking.location,
      roomType: booking.roomType,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      numberOfNights: booking.numberOfNights,
      pricePerNight: booking.pricePerNight,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingDate: booking.createdAt,
      guest: {
        name: booking.user?.name,
        email: booking.user?.email,
        phone: booking.user?.phone,
      },
      specialRequests: booking.specialRequests,
    }))

    res.status(200).json({
      success: true,
      message: "Hotel bookings retrieved successfully",
      data: {
        bookings: transformedBookings,
        count: transformedBookings.length,
      },
    })
  } catch (error) {
    console.error("Get hotel bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotel bookings",
      error: error.message,
    })
  }
}

/**
 * @desc    Update booking status (confirm, check-in, check-out)
 * @route   PATCH /api/owner/bookings/:id/status
 * @access  Private (Hotel Owner)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    const bookingId = req.params.id

    // Validate status
    const validStatuses = ["pending", "confirmed", "checked-in", "checked-out", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    // Find booking for this hotel
    const booking = await Booking.findOne({
      _id: bookingId,
      hotel: owner._id,
    }).populate("user", "name email phone")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Validate status transitions
    const statusTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["checked-in", "cancelled"],
      "checked-in": ["checked-out"],
      "checked-out": [],
      cancelled: [],
    }

    if (!statusTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`,
      })
    }

    // Update status
    booking.status = status
    await booking.save()

    // Log activity based on status
    const actionMap = {
      'confirmed': 'booking_confirmed',
      'cancelled': 'booking_cancelled',
      'checked-in': 'booking_checked_in',
      'checked-out': 'booking_checked_out',
    }

    await logActivity({
      action: actionMap[status] || 'booking_updated',
      description: `Booking ${booking.bookingId} status changed to ${status}`,
      entityType: 'booking',
      entityId: booking._id,
      metadata: {
        bookingId: booking.bookingId,
        previousStatus: booking._doc?.status || 'unknown',
        newStatus: status,
        guestName: booking.user?.name,
      },
      owner: { _id: owner._id },
    })

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: {
        id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
      },
    })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    })
  }
}

/**
 * @desc    Get booking statistics for hotel owner
 * @route   GET /api/owner/bookings/stats
 * @access  Private (Hotel Owner)
 */
const getBookingStats = async (req, res) => {
  try {
    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    const hotelId = owner._id.toString()

    // Get all bookings for this hotel
    const bookings = await Booking.find({ hotel: hotelId })
    
    // Debug logging
    console.log(`[getBookingStats] Owner ID: ${hotelId}`)
    console.log(`[getBookingStats] Total bookings found: ${bookings.length}`)
    if (bookings.length > 0) {
      console.log(`[getBookingStats] Sample booking:`, {
        id: bookings[0]._id,
        hotel: bookings[0].hotel.toString(),
        totalAmount: bookings[0].totalAmount,
        status: bookings[0].status,
        createdAt: bookings[0].createdAt
      })
    }

    // Get review statistics
    const reviewStats = await Review.aggregate([
      { $match: { hotel: owner._id } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ])

    const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0
    const totalReviews = reviewStats.length > 0 ? reviewStats[0].totalReviews : 0

    // Calculate current month dates
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    console.log(`[getBookingStats] Current month: ${currentMonthStart.toISOString()} to ${currentMonthEnd.toISOString()}`)
    console.log(`[getBookingStats] Previous month: ${previousMonthStart.toISOString()} to ${previousMonthEnd.toISOString()}`)

    // Filter bookings by period (using createdAt since bookingDate doesn't exist)
    const currentMonthBookings = bookings.filter(b =>
      b.createdAt >= currentMonthStart && b.createdAt <= currentMonthEnd
    )
    const previousMonthBookings = bookings.filter(b =>
      b.createdAt >= previousMonthStart && b.createdAt <= previousMonthEnd
    )
    
    console.log(`[getBookingStats] Current month bookings: ${currentMonthBookings.length}`)
    console.log(`[getBookingStats] Previous month bookings: ${previousMonthBookings.length}`)

    // Calculate revenues
    const currentMonthRevenue = currentMonthBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalAmount, 0)
    const previousMonthRevenue = previousMonthBookings
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.totalAmount, 0)
    
    console.log(`[getBookingStats] Current month revenue: ${currentMonthRevenue}`)
    console.log(`[getBookingStats] Previous month revenue: ${previousMonthRevenue}`)

    // Calculate growth percentages
    const revenueGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
      : currentMonthRevenue > 0 ? "100" : "0"
    
    const bookingsGrowth = previousMonthBookings.length > 0
      ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length * 100).toFixed(1)
      : currentMonthBookings.length > 0 ? "100" : "0"

    // Calculate occupancy rate (based on total rooms available)
    const totalRooms = owner.rooms?.length || 1
    const currentNight = new Date()
    const tonightBookings = bookings.filter(b =>
      b.status === "confirmed" || b.status === "checked-in"
    ).filter(b => {
      const checkIn = new Date(b.checkIn)
      const checkOut = new Date(b.checkOut)
      return currentNight >= checkIn && currentNight < checkOut
    })
    const occupancyRate = Math.min(100, Math.round((tonightBookings.length / totalRooms) * 100))

    // Calculate statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length,
      checkedIn: bookings.filter(b => b.status === "checked-in").length,
      checkedOut: bookings.filter(b => b.status === "checked-out").length,
      cancelled: bookings.filter(b => b.status === "cancelled").length,
      totalRevenue: bookings
        .filter(b => b.status !== "cancelled")
        .reduce((sum, b) => sum + b.totalAmount, 0),
      upcomingRevenue: bookings
        .filter(b => b.status === "confirmed" || b.status === "pending")
        .reduce((sum, b) => sum + b.totalAmount, 0),
      currentMonthRevenue,
      previousMonthRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      bookingsGrowth: parseFloat(bookingsGrowth),
      occupancyRate,
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: totalReviews,
    }

    console.log(`[getBookingStats] Full stats:`, stats)

    res.status(200).json({
      success: true,
      message: "Booking statistics retrieved successfully",
      data: stats,
    })
  } catch (error) {
    console.error("Get booking stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve booking statistics",
      error: error.message,
    })
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getHotelBookings,
  updateBookingStatus,
  getBookingStats,
}
