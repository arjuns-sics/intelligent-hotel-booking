const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Intelligent Hotel Booking API",
      version: "1.0.0",
      description: "API documentation for the Intelligent Hotel Booking system",
    },
    servers: [
      {
        url: "/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to the API docs
}

const specs = swaggerJsdoc(options)

// Configure Swagger to use local resources to avoid SSL issues
const swaggerOptions = {

  // Disable external resources that cause SSL issues
  explorer: false,
  customSiteTitle: "Intelligent Hotel Booking API Docs"
}

module.exports = { swaggerUi, specs, swaggerOptions }
