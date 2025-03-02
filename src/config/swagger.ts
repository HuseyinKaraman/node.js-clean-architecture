import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import { Express, Request, Response } from "express"
import { constants } from "../constants"
import logger from "../interfaces/logger/Logger"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Filayo API",
      version: "1.0.0",
      description: "Filayo API Documentation",
    },
    servers: [
      {
        url:
          constants.NODE_ENV === "production"
            ? ""
            : `http://localhost:${constants.PORT}`,
        description:
          constants.NODE_ENV === "production"
            ? "Production server"
            : "Local Development server",
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
  apis: ['src/docs/swagger/*.yaml'],
}

const swaggerSpec = swaggerJSDoc(options)

export const setupSwagger = (app: Express) => {
  //! if (nodeEnv !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  app.get("/api-docs-json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json")
    res.send(swaggerSpec)
  })

  logger.info("Swagger is running on http://localhost:8000/api-docs")
  //! }
}
