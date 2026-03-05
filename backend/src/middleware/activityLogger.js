const { logActivity } = require("../controllers/activityController")

/**
 * Middleware to log activities
 * Usage: After an action is performed, call this middleware
 * 
 * Options:
 * - action: The action type (e.g., 'booking_confirmed')
 * - description: Description of the action
 * - entityType: Type of entity (booking, review, room, etc.)
 * - entityIdField: Field name where entity ID is stored (default: 'id' or '_id')
 * - metadata: Additional metadata to store
 */
const createActivityLogger = (options) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json

    // Override json method to log after response is sent
    res.json = function (data) {
      // Log activity asynchronously (don't wait)
      const entityId =
        options.entityIdField
          ? data?.data?.[options.entityIdField] ||
            data?.data?.id ||
            req.params.id ||
            req.body[options.entityIdField]
          : null

      logActivity({
        action: options.action,
        description:
          typeof options.description === "function"
            ? options.description(req, data)
            : options.description,
        entityType: options.entityType,
        entityId,
        metadata: {
          ...options.metadata,
          ...req.body,
        },
        user: req.user,
        owner: req.owner,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
      })

      // Call original json method
      return originalJson.call(this, data)
    }

    next()
  }
}

/**
 * Direct activity logging middleware for simple cases
 * Logs the activity immediately when the route is hit
 */
const logActivityMiddleware = (action, descriptionFn) => {
  return async (req, res, next) => {
    // Store original json to log after successful response
    const originalJson = res.json
    const originalSend = res.send

    const logAfterSuccess = (data) => {
      const description =
        typeof descriptionFn === "function" ? descriptionFn(req, data) : descriptionFn

      logActivity({
        action,
        description,
        entityType: req.entityType || "booking",
        entityId: req.params.id || req.body.id,
        user: req.user,
        owner: req.owner,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("user-agent"),
      })
    }

    res.json = function (data) {
      if (data?.success) {
        logAfterSuccess(data)
      }
      return originalJson.call(this, data)
    }

    res.send = function (data) {
      logAfterSuccess(null)
      return originalSend.call(this, data)
    }

    next()
  }
}

module.exports = {
  createActivityLogger,
  logActivityMiddleware,
  logActivity,
}
