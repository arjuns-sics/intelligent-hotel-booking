const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelOwner",
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String], // Array of base64 encoded images
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
reviewSchema.index({ user: 1, createdAt: -1 })
reviewSchema.index({ hotel: 1, createdAt: -1 })
reviewSchema.index({ booking: 1 }, { unique: true }) // One review per booking

// Virtual for formatted review ID
reviewSchema.virtual("reviewId").get(function () {
  return `RV${this._id.toString().slice(-6).toUpperCase()}`
})

// Ensure virtuals are included in JSON responses
reviewSchema.set("toJSON", { virtuals: true })
reviewSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Review", reviewSchema)
