const express = require("express")
const router = express.Router()
const {
  getOwnerRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController")
const { protectOwner } = require("../middleware/auth")

// All routes are protected
router.use(protectOwner)

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management endpoints for hotel owners
 */

/**
 * @swagger
 * /owner/rooms:
 *   get:
 *     summary: Get all rooms for hotel owner
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", getOwnerRooms)

/**
 * @swagger
 * /owner/rooms/{roomId}:
 *   get:
 *     summary: Get single room by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room retrieved successfully
 *       404:
 *         description: Room not found
 */
router.get("/:roomId", getRoomById)

/**
 * @swagger
 * /owner/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - maxGuests
 *               - beds
 *               - size
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               maxGuests:
 *                 type: number
 *               beds:
 *                 type: string
 *               size:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, occupied, maintenance]
 *               roomNumber:
 *                 type: string
 *               floor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", createRoom)

/**
 * @swagger
 * /owner/rooms/{roomId}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - maxGuests
 *               - beds
 *               - size
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               maxGuests:
 *                 type: number
 *               beds:
 *                 type: string
 *               size:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, occupied, maintenance]
 *               roomNumber:
 *                 type: string
 *               floor:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated successfully
 *       404:
 *         description: Room not found
 */
router.put("/:roomId", updateRoom)

/**
 * @swagger
 * /owner/rooms/{roomId}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 */
router.delete("/:roomId", deleteRoom)

module.exports = router
