import { Server } from './infrastructure/server/Server';
import { UserController } from './interfaces/controllers/UserController';
import { UserRoutes } from './interfaces/routes/UserRoutes';
import MongoDBConnection from './config/MongooseConfig';
import 'express-async-errors';
import dotenv from 'dotenv';
import logger from './interfaces/logger/Logger';
import { constants } from './constants/index';

dotenv.config();

const startApplication = async () => {
    try {
        // MongoDB bağlantısı
        const mongoConnection = MongoDBConnection.getInstance();
        await mongoConnection.connect((constants.NODE_ENV === 'production' ? constants.PRODUCTION_DATABASE_URL : constants.DEVELOPMENT_DATABASE_URL) as string);

        // Port ayarı
        const port = constants.PORT ? parseInt(constants.PORT) : 8000;

        // Server instance
        const server = new Server(port);

        // Controller ve Routes
        const userController = new UserController(server);
        const userRoutes = new UserRoutes(userController);
        server.addRoute(userRoutes);

        // Server'ı başlat
        server.start();

        logger.info(`Server started successfully on port ${port}`);
    } catch (error) {
        logger.error('Error starting application:', error);
        process.exit(1);
    }
};

// Uncaught error handling
process.on('unhandledRejection', (error: Error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

startApplication();