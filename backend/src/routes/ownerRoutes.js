const express = require("express")
const router = express.Router()
const {
  registerOwner,
  loginOwner,
  getOwnerProfile,
  completeOnboarding,
} = require("../controllers/ownerAuthController")
const { protectOwner } = require("../middleware/auth")
const roomRoutes = require("./rooms")

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

module.exports = router
