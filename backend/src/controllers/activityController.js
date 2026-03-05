const Activity = require("../models/Activity")

/**
 * @desc    Log an activity
 * @param   {Object} options - Activity options
 * @param   {String} options.action - Action type
 * @param   {String} options.description - Activity description
 * @param   {String} options.entityType - Entity type (booking, review, room, etc.)
 * @param   {String} options.entityId - Entity ID
 * @param   {Object} options.metadata - Additional metadata
 * @param   {Object} options.user - User object (optional)
 * @param   {Object} options.owner - Owner object (optional)
 * @param   {String} options.ipAddress - IP address (optional)
 * @param   {String} options.userAgent - User agent (optional)
 */
const logActivity = async ({
  action,
  description,
  entityType,
  entityId,
  metadata = {},
  user,
  owner,
  ipAddress,
  userAgent,
}) => {
  try {
    const activity = await Activity.create({
      action,
      description,
      entityType,
      entityId,
      metadata,
      user: user?._id || user,
      owner: owner?._id || owner,
      ipAddress,
      userAgent,
    })
    return activity
  } catch (error) {
    console.error("Activity logging error:", error)
    // Don't throw error - logging should not break the app
  }
}

/**
 * @desc    Get activities for hotel owner
 * @route   GET /api/owner/activities
 * @access  Private (Hotel Owner)
 */
const getOwnerActivities = async (req, res) => {
  try {
    const { limit = 50, offset = 0, action, entityType } = req.query

    const query = { owner: req.ownerId }
    if (action) query.action = action
    if (entityType) query.entityType = entityType

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate("user", "name email")

    const total = await Activity.countDocuments(query)

    // Transform activities
    const transformedActivities = activities.map((activity) => ({
      id: activity._id,
      action: activity.action,
      description: activity.description,
      entityType: activity.entityType,
      entityId: activity.entityId,
      metadata: activity.metadata,
      date: activity.createdAt,
      user: activity.user
        ? {
            name: activity.user.name,
            email: activity.user.email,
          }
        : null,
    }))

    res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: {
        activities: transformedActivities,
        total,
        count: transformedActivities.length,
      },
    })
  } catch (error) {
    console.error("Get owner activities error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve activities",
      error: error.message,
    })
  }
}

/**
 * @desc    Get activity statistics for hotel owner
 * @route   GET /api/owner/activities/stats
 * @access  Private (Hotel Owner)
 */
const getActivityStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const query = { owner: req.ownerId }
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    const activities = await Activity.find(query)

    // Calculate statistics
    const stats = {
      total: activities.length,
      byAction: {},
      byEntityType: {},
      today: activities.filter(
        (a) => new Date(a.createdAt).toDateString() === new Date().toDateString()
      ).length,
      thisWeek: activities.filter((a) => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(a.createdAt) >= weekAgo
      }).length,
    }

    // Group by action
    activities.forEach((activity) => {
      stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1
      stats.byEntityType[activity.entityType] =
        (stats.byEntityType[activity.entityType] || 0) + 1
    })

    res.status(200).json({
      success: true,
      message: "Activity statistics retrieved successfully",
      data: stats,
    })
  } catch (error) {
    console.error("Get activity stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity statistics",
      error: error.message,
    })
  }
}

module.exports = {
  logActivity,
  getOwnerActivities,
  getActivityStats,
}
