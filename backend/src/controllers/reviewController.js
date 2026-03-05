const mongoose = require("mongoose")
const Review = require("../models/Review")
const Booking = require("../models/Booking")
const HotelOwner = require("../models/HotelOwner")
const { logActivity } = require("../middleware/activityLogger")

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (User)
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, hotelId, rating, comment, images = [] } = req.body

    // Validation
    if (!bookingId || !hotelId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      })
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.userId,
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if booking is completed (checked-out)
    if (booking.status !== "checked-out") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed stays",
      })
    }

    // Check if user already reviewed this booking
    const existingReview = await Review.findOne({ booking: bookingId })
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      })
    }

    // Verify hotel exists
    const hotel = await HotelOwner.findById(hotelId)
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    // Validate images (base64 strings)
    const validImages = []
    for (const img of images) {
      if (typeof img === "string" && img.startsWith("data:image/")) {
        // Check image size (limit to 1MB per image after compression)
        const sizeInBytes = Buffer.byteLength(img, "utf8")
        if (sizeInBytes <= 1 * 1024 * 1024) {
          validImages.push(img)
        } else {
          console.warn(`Image too large: ${sizeInBytes} bytes, skipping`)
        }
      }
    }

    // Create review
    const review = await Review.create({
      user: req.userId,
      booking: bookingId,
      hotel: hotelId,
      hotelName: booking.hotelName,
      rating,
      comment,
      images: validImages,
    })

    // Populate user details
    const populatedReview = await Review.findById(review._id).populate("user", "name email")

    // Log activity
    await logActivity({
      action: 'review_created',
      description: `New ${review.rating}-star review for ${review.hotelName} by ${req.user?.name || 'Guest'}`,
      entityType: 'review',
      entityId: review._id,
      metadata: {
        reviewId: populatedReview.reviewId,
        hotelName: review.hotelName,
        rating: review.rating,
      },
      user: req.user,
      owner: { _id: review.hotel },
    })

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        id: populatedReview._id,
        reviewId: populatedReview.reviewId,
        bookingId: populatedReview.booking._id,
        hotelId: populatedReview.hotel.toString(),
        hotelName: populatedReview.hotelName,
        rating: populatedReview.rating,
        comment: populatedReview.comment,
        images: populatedReview.images,
        date: populatedReview.createdAt,
        user: {
          name: populatedReview.user?.name,
        },
      },
    })
  } catch (error) {
    console.error("Create review error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    })
  }
}

/**
 * @desc    Get all reviews for current user
 * @route   GET /api/reviews/my-reviews
 * @access  Private (User)
 */
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("booking", "hotelName checkIn checkOut")

    // Transform reviews
    const transformedReviews = reviews.map((review) => ({
      id: review._id,
      reviewId: review.reviewId,
      bookingId: review.booking?._id,
      hotelId: review.hotel.toString(),
      hotelName: review.hotelName || review.booking?.hotelName,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      date: review.createdAt,
    }))

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews: transformedReviews,
        count: transformedReviews.length,
      },
    })
  } catch (error) {
    console.error("Get user reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
      error: error.message,
    })
  }
}

/**
 * @desc    Get all reviews for a hotel
 * @route   GET /api/reviews/hotel/:hotelId
 * @access  Public
 */
const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params
    const { limit = 10, offset = 0 } = req.query

    // Convert to ObjectId if needed
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)

    const reviews = await Review.find({ hotel: hotelObjectId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate("user", "name")

    // Transform reviews
    const transformedReviews = reviews.map((review) => ({
      id: review._id,
      reviewId: review.reviewId,
      hotelId: review.hotel.toString(),
      hotelName: review.hotelName,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      date: review.createdAt,
      user: {
        name: review.user?.name,
      },
    }))

    // Calculate average rating
    const avgRating = await Review.aggregate([
      { $match: { hotel: hotelObjectId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ])

    res.status(200).json({
      success: true,
      message: "Hotel reviews retrieved successfully",
      data: {
        reviews: transformedReviews,
        count: transformedReviews.length,
        averageRating: avgRating[0]?.avgRating || 0,
      },
    })
  } catch (error) {
    console.error("Get hotel reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotel reviews",
      error: error.message,
    })
  }
}

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (User)
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.userId,
    })

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    await review.deleteOne()

    // Log activity
    await logActivity({
      action: 'review_deleted',
      description: `Review deleted for ${review.hotelName}`,
      entityType: 'review',
      entityId: review._id,
      metadata: {
        reviewId: review.reviewId,
        hotelName: review.hotelName,
      },
      user: req.user,
      owner: { _id: review.hotel },
    })

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    })
  }
}

/**
 * @desc    Get review statistics for a hotel
 * @route   GET /api/reviews/hotel/:hotelId/stats
 * @access  Public
 */
const getReviewStats = async (req, res) => {
  try {
    const { hotelId } = req.params

    // Convert to ObjectId if needed
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)

    const reviews = await Review.find({ hotel: hotelObjectId })

    // Calculate statistics
    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

    // Rating distribution
    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    res.status(200).json({
      success: true,
      message: "Review statistics retrieved successfully",
      data: {
        totalReviews,
        averageRating: averageRating.toFixed(1),
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Get review stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review statistics",
      error: error.message,
    })
  }
}

/**
 * @desc    Get reviews for hotel owner's hotel
 * @route   GET /api/owner/reviews
 * @access  Private (Hotel Owner)
 */
const getOwnerReviews = async (req, res) => {
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

    // Convert to ObjectId for proper matching
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId)

    const reviews = await Review.find({ hotel: hotelObjectId })
      .sort({ createdAt: -1 })
      .populate("user", "name email")

    // Transform reviews
    const transformedReviews = reviews.map((review) => ({
      id: review._id,
      reviewId: review.reviewId,
      hotelId: review.hotel.toString(),
      hotelName: review.hotelName,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      date: review.createdAt,
      user: {
        name: review.user?.name,
        email: review.user?.email,
      },
    }))

    res.status(200).json({
      success: true,
      message: "Hotel reviews retrieved successfully",
      data: {
        reviews: transformedReviews,
        count: transformedReviews.length,
      },
    })
  } catch (error) {
    console.error("Get owner reviews error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotel reviews",
      error: error.message,
    })
  }
}

module.exports = {
  createReview,
  getUserReviews,
  getHotelReviews,
  deleteReview,
  getReviewStats,
  getOwnerReviews,
}
