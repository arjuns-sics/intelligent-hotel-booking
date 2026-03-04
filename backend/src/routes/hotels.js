const express = require("express")
const router = express.Router()
const {
  getAllHotels,
  getHotelById,
} = require("../controllers/hotelController")

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Public hotel endpoints for users
 */

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Get all hotels (public)
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location to search
 *       - in: query
 *         name: checkIn
 *         schema:
 *           type: string
 *         description: Check-in date
 *       - in: query
 *         name: checkOut
 *         schema:
 *           type: string
 *         description: Check-out date
 *       - in: query
 *         name: guests
 *         schema:
 *           type: number
 *         description: Number of guests
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated amenities
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, name]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Hotels retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/", getAllHotels)

/**
 * @swagger
 * /hotels/{id}:
 *   get:
 *     summary: Get single hotel by ID (public)
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel retrieved successfully
 *       404:
 *         description: Hotel not found
 */
router.get("/:id", getHotelById)

module.exports = router
