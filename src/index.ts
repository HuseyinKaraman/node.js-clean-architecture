import { Server } from './infrastructure/server/Server';
import { UserController } from './interfaces/controllers/UserController';
import { UserRoutes } from './interfaces/routes/UserRoutes';
import { MongooseUserRepository } from './infrastructure/databases/mongoose/MongooseUserRepository';
import  MongoDBConnection  from './config/MongooseConfig';
import 'express-async-errors';
import dotenv from 'dotenv';
import { UserUseCase } from './application/use-cases/userUseCase';
import { UserModel } from './infrastructure/databases/mongoose/model/UserModel';
import { UserRepositoryFactory } from './application/factories/UserRepositoryFactory';
import logger from './interfaces/logger/Logger';

dotenv.config();

const startApplication = async () => {
  const mongoConnection = MongoDBConnection.getInstance();
  await mongoConnection.connect(process.env.MONGODB_URI as string);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
  const userRepository = UserRepositoryFactory.create(UserModel);
  const userUseCase = new UserUseCase(userRepository);

  const userController = new UserController(userUseCase, null as any);
  const userRoutes = new UserRoutes(userController);

  const server = new Server(port, userRoutes);
  userController['server'] = server;  // Inject server after initialization
  server.start();
};

startApplication().catch((error) => {
  logger.error('Error starting application:', error)
  process.exit(1);
});
