const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelOwner",
    },
    action: {
      type: String,
      required: true,
      enum: [
        'booking_created',
        'booking_confirmed',
        'booking_cancelled',
        'booking_checked_in',
        'booking_checked_out',
        'review_created',
        'review_deleted',
        'room_added',
        'room_updated',
        'room_deleted',
        'profile_updated',
        'login',
        'logout',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['booking', 'review', 'room', 'user', 'owner'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: Object,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
activitySchema.index({ user: 1, createdAt: -1 })
activitySchema.index({ owner: 1, createdAt: -1 })
activitySchema.index({ entityType: 1, entityId: 1 })

module.exports = mongoose.model("Activity", activitySchema)
