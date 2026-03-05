const express = require("express")
const router = express.Router()
const {
  createReview,
  getUserReviews,
  getHotelReviews,
  deleteReview,
  getReviewStats,
} = require("../controllers/reviewController")
const { protectUser } = require("../middleware/userAuth")

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management for hotel stays
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review for a booking
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - hotelId
 *               - rating
 *               - comment
 *             properties:
 *               bookingId:
 *                 type: string
 *               hotelId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Base64 encoded image strings
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Validation error or already reviewed
 *       404:
 *         description: Booking or hotel not found
 */
router.post("/", protectUser, createReview)

/**
 * @swagger
 * /reviews/my-reviews:
 *   get:
 *     summary: Get all reviews for current user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-reviews", protectUser, getUserReviews)

/**
 * @swagger
 * /reviews/hotel/{hotelId}:
 *   get:
 *     summary: Get all reviews for a hotel
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of reviews to skip
 *     responses:
 *       200:
 *         description: Hotel reviews retrieved successfully
 */
router.get("/hotel/:hotelId", getHotelReviews)

/**
 * @swagger
 * /reviews/hotel/{hotelId}/stats:
 *   get:
 *     summary: Get review statistics for a hotel
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Review statistics retrieved successfully
 */
router.get("/hotel/:hotelId/stats", getReviewStats)

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete("/:id", protectUser, deleteReview)

module.exports = router
