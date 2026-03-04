const express = require("express")
const router = express.Router()
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController")
const { protectUser } = require("../middleware/userAuth")

// All routes are protected (require user authentication)
router.use(protectUser)

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Hotel booking management for users
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new hotel booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - roomId
 *               - roomType
 *               - checkIn
 *               - checkOut
 *               - guests
 *               - pricePerNight
 *             properties:
 *               hotelId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               roomType:
 *                 type: string
 *               checkIn:
 *                 type: string
 *                 format: date
 *               checkOut:
 *                 type: string
 *                 format: date
 *               guests:
 *                 type: number
 *               pricePerNight:
 *                 type: number
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Hotel not found
 */
router.post("/", createBooking)

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings for current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, checked-in, checked-out, cancelled, all]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getUserBookings)

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */
router.get("/:id", getBookingById)

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.delete("/:id", cancelBooking)

module.exports = router
