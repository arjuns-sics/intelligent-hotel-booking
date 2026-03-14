const mongoose = require("mongoose")
require("dotenv").config()

const User = require("../models/User")
const HotelOwner = require("../models/HotelOwner")
const Booking = require("../models/Booking")

async function checkData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB\n")

    // Check counts
    const userCount = await User.countDocuments()
    const hotelOwnerCount = await HotelOwner.countDocuments()
    const hotelCount = await HotelOwner.countDocuments({ onboardingComplete: true })
    const bookingCount = await Booking.countDocuments()

    console.log("=== Database Stats ===")
    console.log(`Total Users: ${userCount}`)
    console.log(`Total Hotel Owners: ${hotelOwnerCount}`)
    console.log(`Hotels with Complete Onboarding: ${hotelCount}`)
    console.log(`Total Bookings: ${bookingCount}`)

    // Show some sample data
    console.log("\n=== Sample Users ===")
    const users = await User.find().limit(3).select('name email')
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`)
    })

    console.log("\n=== Sample Hotels ===")
    const hotels = await HotelOwner.find({ onboardingComplete: true }).limit(3).select('name email hotelName city')
    hotels.forEach(hotel => {
      console.log(`- ${hotel.hotelName || 'N/A'} by ${hotel.name} (${hotel.city || 'N/A'})`)
    })

    console.log("\n=== Sample Bookings ===")
    const bookings = await Booking.find().limit(3).select('bookingId hotelName status totalAmount')
    bookings.forEach(booking => {
      console.log(`- ${booking.bookingId}: ${booking.hotelName} - ₹${booking.totalAmount} (${booking.status})`)
    })

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

checkData()
