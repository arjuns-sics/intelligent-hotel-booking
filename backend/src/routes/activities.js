const express = require("express")
const router = express.Router()
const {
  getOwnerActivities,
  getActivityStats,
} = require("../controllers/activityController")
const { protectOwner } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity logging for hotel owners
 */

/**
 * @swagger
 * /owner/activities:
 *   get:
 *     summary: Get all activities for hotel owner
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of activities to skip
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", protectOwner, getOwnerActivities)

/**
 * @swagger
 * /owner/activities/stats:
 *   get:
 *     summary: Get activity statistics
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/stats", protectOwner, getActivityStats)

module.exports = router
