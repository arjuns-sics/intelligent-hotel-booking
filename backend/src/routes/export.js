const express = require("express")
const router = express.Router()
const {
  exportBookingsCSV,
  exportReviewsCSV,
  exportActivitiesCSV,
  exportReportCSV,
} = require("../controllers/exportController")
const { protectOwner } = require("../middleware/auth")

/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Data export endpoints for hotel owners
 */

/**
 * @swagger
 * /owner/export/bookings/csv:
 *   get:
 *     summary: Export bookings as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by booking status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: CSV file downloaded
 *       401:
 *         description: Unauthorized
 */
router.get("/bookings/csv", protectOwner, exportBookingsCSV)

/**
 * @swagger
 * /owner/export/reviews/csv:
 *   get:
 *     summary: Export reviews as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file downloaded
 *       401:
 *         description: Unauthorized
 */
router.get("/reviews/csv", protectOwner, exportReviewsCSV)

/**
 * @swagger
 * /owner/export/activities/csv:
 *   get:
 *     summary: Export activities as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: CSV file downloaded
 *       401:
 *         description: Unauthorized
 */
router.get("/activities/csv", protectOwner, exportActivitiesCSV)

/**
 * @swagger
 * /owner/export/report/csv:
 *   get:
 *     summary: Export comprehensive report as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: CSV file downloaded
 *       401:
 *         description: Unauthorized
 */
router.get("/report/csv", protectOwner, exportReportCSV)

module.exports = router
