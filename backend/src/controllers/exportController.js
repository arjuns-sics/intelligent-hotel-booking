const Booking = require("../models/Booking")
const Review = require("../models/Review")
const Activity = require("../models/Activity")
const HotelOwner = require("../models/HotelOwner")

/**
 * Convert data to CSV format
 */
const convertToCSV = (data, fields) => {
  if (!data || data.length === 0) return ''

  const header = fields.join(',')
  const rows = data.map(item =>
    fields
      .map(field => {
        const value = item[field] !== null && item[field] !== undefined ? item[field] : ''
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(',')
  )

  return [header, ...rows].join('\n')
}

/**
 * @desc    Export bookings as CSV
 * @route   GET /api/owner/export/bookings/csv
 * @access  Private (Hotel Owner)
 */
const exportBookingsCSV = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query

    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    // Build query
    const query = { hotel: owner._id }
    if (status && status !== 'all') query.status = status
    if (startDate || endDate) {
      query.checkIn = {}
      if (startDate) query.checkIn.$gte = new Date(startDate)
      if (endDate) query.checkIn.$lte = new Date(endDate)
    }

    const bookings = await Booking.find(query)
      .sort({ checkIn: -1 })
      .populate("user", "name email phone")

    // Format data for CSV
    const formattedData = bookings.map(booking => ({
      bookingId: booking.bookingId,
      guestName: booking.user?.name || 'N/A',
      guestEmail: booking.user?.email || 'N/A',
      guestPhone: booking.user?.phone || 'N/A',
      hotelName: booking.hotelName,
      roomType: booking.roomType,
      checkIn: new Date(booking.checkIn).toLocaleDateString(),
      checkOut: new Date(booking.checkOut).toLocaleDateString(),
      guests: booking.guests,
      numberOfNights: booking.numberOfNights,
      pricePerNight: booking.pricePerNight,
      totalAmount: booking.totalAmount,
      status: booking.status,
      bookingDate: new Date(booking.createdAt).toLocaleDateString(),
    }))

    const fields = [
      'bookingId', 'guestName', 'guestEmail', 'guestPhone',
      'hotelName', 'roomType', 'checkIn', 'checkOut',
      'guests', 'numberOfNights', 'pricePerNight', 'totalAmount',
      'status', 'bookingDate'
    ]

    const csv = convertToCSV(formattedData, fields)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv')
    res.send(csv)
  } catch (error) {
    console.error("Export bookings CSV error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export bookings",
      error: error.message,
    })
  }
}

/**
 * @desc    Export reviews as CSV
 * @route   GET /api/owner/export/reviews/csv
 * @access  Private (Hotel Owner)
 */
const exportReviewsCSV = async (req, res) => {
  try {
    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    const reviews = await Review.find({ hotel: owner._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email")

    // Format data for CSV
    const formattedData = reviews.map(review => ({
      reviewId: review.reviewId,
      guestName: review.user?.name || 'Anonymous',
      guestEmail: review.user?.email || 'N/A',
      rating: review.rating,
      comment: review.comment.replace(/\n/g, ' '),
      hotelName: review.hotelName,
      date: new Date(review.createdAt).toLocaleDateString(),
    }))

    const fields = ['reviewId', 'guestName', 'guestEmail', 'rating', 'comment', 'hotelName', 'date']

    const csv = convertToCSV(formattedData, fields)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv')
    res.send(csv)
  } catch (error) {
    console.error("Export reviews CSV error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export reviews",
      error: error.message,
    })
  }
}

/**
 * @desc    Export activities as CSV
 * @route   GET /api/owner/export/activities/csv
 * @access  Private (Hotel Owner)
 */
const exportActivitiesCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Build query
    const query = { owner: req.ownerId }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")

    // Format data for CSV
    const formattedData = activities.map(activity => ({
      date: new Date(activity.createdAt).toLocaleString(),
      action: activity.action,
      description: activity.description.replace(/\n/g, ' '),
      entityType: activity.entityType,
      userName: activity.user?.name || 'System',
      userEmail: activity.user?.email || 'N/A',
    }))

    const fields = ['date', 'action', 'description', 'entityType', 'userName', 'userEmail']

    const csv = convertToCSV(formattedData, fields)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=activities.csv')
    res.send(csv)
  } catch (error) {
    console.error("Export activities CSV error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export activities",
      error: error.message,
    })
  }
}

/**
 * @desc    Export comprehensive report as CSV
 * @route   GET /api/owner/export/report/csv
 * @access  Private (Hotel Owner)
 */
const exportReportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Get owner's hotel ID
    const owner = await HotelOwner.findById(req.ownerId)
    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found or onboarding incomplete",
      })
    }

    // Get data
    const bookingQuery = { hotel: owner._id }
    if (startDate || endDate) {
      bookingQuery.checkIn = {}
      if (startDate) bookingQuery.checkIn.$gte = new Date(startDate)
      if (endDate) bookingQuery.checkIn.$lte = new Date(endDate)
    }

    const bookings = await Booking.find(bookingQuery).sort({ checkIn: -1 })
    const reviews = await Review.find({ hotel: owner._id }).sort({ createdAt: -1 })

    // Calculate summary
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const averageRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0

    // Create summary CSV
    const summary = [
      'Metric,Value',
      `Report Generated,${new Date().toLocaleString()}`,
      `Date Range,${startDate || 'All time'} to ${endDate || 'Present'}`,
      `Total Bookings,${totalBookings}`,
      `Total Revenue,₹${totalRevenue}`,
      `Total Reviews,${reviews.length}`,
      `Average Rating,${averageRating}/5`,
      '',
      'Recent Bookings,',
    ]

    const bookingFields = ['bookingId', 'guestName', 'checkIn', 'checkOut', 'totalAmount', 'status']
    const formattedBookings = bookings.slice(0, 50).map(booking => ({
      bookingId: booking.bookingId,
      guestName: booking.user?.name || 'N/A',
      checkIn: new Date(booking.checkIn).toLocaleDateString(),
      checkOut: new Date(booking.checkOut).toLocaleDateString(),
      totalAmount: booking.totalAmount,
      status: booking.status,
    }))

    const bookingsCSV = convertToCSV(formattedBookings, bookingFields)

    const csv = [...summary, bookingsCSV].join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=hotel-report.csv')
    res.send(csv)
  } catch (error) {
    console.error("Export report CSV error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to export report",
      error: error.message,
    })
  }
}

module.exports = {
  exportBookingsCSV,
  exportReviewsCSV,
  exportActivitiesCSV,
  exportReportCSV,
}
