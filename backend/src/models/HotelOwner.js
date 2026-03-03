const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const hotelOwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    // Hotel details (one owner = one hotel)
    hotelName: {
      type: String,
      trim: true,
    },
    hotelDescription: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    rooms: {
      type: [{
        name: String,
        description: String,
        price: Number,
        maxGuests: Number,
        beds: String,
        size: String,
        amenities: [String],
      }],
      default: [],
    },
    checkInTime: {
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      default: "11:00",
    },
    cancellationPolicy: {
      type: String,
      default: "flexible",
      enum: ["flexible", "moderate", "strict", "non-refundable"],
    },
    petPolicy: {
      type: String,
      default: "not-allowed",
      enum: ["allowed", "not-allowed", "on-request"],
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
hotelOwnerSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
hotelOwnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const HotelOwner = mongoose.model("HotelOwner", hotelOwnerSchema)

module.exports = HotelOwner
