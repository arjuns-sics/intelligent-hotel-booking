const Booking = require("../models/Booking")
const HotelOwner = require("../models/HotelOwner")

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
      hotelImage: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
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
 * @route   GET /api/bookings/hotel/:hotelId
 * @access  Private (Hotel Owner)
 */
const getHotelBookings = async (req, res) => {
  try {
    const { status } = req.query
    const hotelId = req.params.hotelId

    // Verify owner owns this hotel
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || owner._id.toString() !== hotelId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access bookings for this hotel",
      })
    }

    // Build query
    const query = { hotel: hotelId }
    if (status && status !== "all") {
      query.status = status
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")

    res.status(200).json({
      success: true,
      message: "Hotel bookings retrieved successfully",
      data: {
        bookings,
        count: bookings.length,
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

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getHotelBookings,
}
