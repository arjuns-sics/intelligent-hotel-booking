module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/learning-system",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
}