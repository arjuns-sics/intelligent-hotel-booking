const express = require("express")
const router = express.Router()
const {
  registerOwner,
  loginOwner,
  getOwnerProfile,
  completeOnboarding,
} = require("../controllers/ownerAuthController")
const {
  getHotelBookings,
  updateBookingStatus,
  getBookingStats
} = require("../controllers/bookingController")
const { getOwnerReviews } = require("../controllers/reviewController")
const { protectOwner } = require("../middleware/auth")
const roomRoutes = require("./rooms")
const activityRoutes = require("./activities")
const exportRoutes = require("./export")

/**
 * @swagger
 * tags:
 *   name: Hotel Owner Auth
 *   description: Hotel owner authentication endpoints
 */

/**
 * @swagger
 * /owner/register:
 *   post:
 *     summary: Register a new hotel owner
 *     tags: [Hotel Owner Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post("/register", registerOwner)

/**
 * @swagger
 * /owner/login:
 *   post:
 *     summary: Login hotel owner
 *     tags: [Hotel Owner Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginOwner)

/**
 * @swagger
 * /owner/profile:
 *   get:
 *     summary: Get hotel owner profile
 *     tags: [Hotel Owner Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", protectOwner, getOwnerProfile)

/**
 * @swagger
 * /owner/onboarding/complete:
 *   patch:
 *     summary: Mark onboarding as complete
 *     tags: [Hotel Owner Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding marked complete
 *       401:
 *         description: Unauthorized
 */
router.patch("/onboarding/complete", protectOwner, completeOnboarding)

// Room management routes
router.use("/rooms", roomRoutes)

/**
 * @swagger
 * /owner/bookings:
 *   get:
 *     summary: Get all bookings for hotel owner's hotel
 *     tags: [Hotel Owner]
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
router.get("/bookings", protectOwner, getHotelBookings)

/**
 * @swagger
 * /owner/bookings/stats:
 *   get:
 *     summary: Get booking statistics for hotel owner
 *     tags: [Hotel Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/bookings/stats", protectOwner, getBookingStats)

/**
 * @swagger
 * /owner/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Hotel Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, checked-in, checked-out, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Booking not found
 */
router.patch("/bookings/:id/status", protectOwner, updateBookingStatus)

/**
 * @swagger
 * /owner/reviews:
 *   get:
 *     summary: Get all reviews for hotel owner's hotel
 *     tags: [Hotel Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/reviews", protectOwner, getOwnerReviews)

// Activity logging routes
router.use("/activities", activityRoutes)

// Export routes
router.use("/export", exportRoutes)

module.exports = router
