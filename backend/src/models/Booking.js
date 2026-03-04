const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelOwner",
      required: true,
    },
    // Snapshot data at time of booking (preserved even if hotel details change)
    hotelName: {
      type: String,
      required: true,
    },
    hotelImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    },
    location: {
      type: String,
      required: true,
    },
    // Room details - stored as embedded data since rooms are embedded in HotelOwner
    roomId: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    roomDetails: {
      price: Number,
      maxGuests: Number,
      beds: String,
      size: String,
      amenities: [String],
    },
    // Booking dates
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfNights: {
      type: Number,
      required: true,
    },
    // Pricing
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    // Booking status
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "checked-out", "cancelled"],
      default: "confirmed",
    },
    cancellationPolicy: {
      type: String,
      default: "flexible",
    },
    specialRequests: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ hotel: 1, status: 1 })
bookingSchema.index({ checkIn: 1, checkOut: 1 })

// Virtual for formatted booking ID
bookingSchema.virtual("bookingId").get(function () {
  return `BK${this._id.toString().slice(-6).toUpperCase()}`
})

// Ensure virtuals are included in JSON responses
bookingSchema.set("toJSON", { virtuals: true })
bookingSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Booking", bookingSchema)
