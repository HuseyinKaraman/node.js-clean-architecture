import dotenv from "dotenv";
import logger from "./interfaces/logger/Logger";
import "express-async-errors";
import { AppBootstrap } from "./infrastructure/bootstrap/AppBootstrap";

dotenv.config();

const startApplication = async () => {
  try {
    const app = new AppBootstrap();
    await app.initialize();
    app.start();
  } catch (error) {
    logger.error("Error starting application:", error);
    process.exit(1);
  }
};

// Uncaught error handling
process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startApplication();
