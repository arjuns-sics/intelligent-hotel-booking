const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const Admin = require("../models/Admin")

async function initializeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@hotel.com" })
    if (existingAdmin) {
      console.log("Admin user already exists!")
      await mongoose.disconnect()
      return
    }

    // Create admin user
    const admin = await Admin.create({
      name: "System Administrator",
      email: "admin@hotel.com",
      password: "admin123", // Will be hashed by pre-save hook
      role: "super-admin",
    })

    console.log("Admin user created successfully!")
    console.log("Email: admin@hotel.com")
    console.log("Password: admin123")
    console.log("\nYou can now login at /admin/login")

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error initializing admin:", error)
    process.exit(1)
  }
}

initializeAdmin()
