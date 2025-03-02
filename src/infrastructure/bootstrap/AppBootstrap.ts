import MongoDBConnection from '../../config/MongooseConfig';
import logger from '../../interfaces/logger/Logger';
import { Server } from '../server/Server';
import { RoutesFactory } from '../../application/factories/RoutesFactory';
import { constants } from '../../constants';

export class AppBootstrap {
  private server: Server;
  private port: number;
  private routesFactory: RoutesFactory;

  constructor() {
    this.port = constants.PORT ? parseInt(constants.PORT) : 8000;
    this.server = new Server(this.port);
    this.routesFactory = new RoutesFactory();
  }

  async initialize(): Promise<void> {
    // MongoDB bağlantısı
    await this.connectToDatabase();
    
    // Rotaları yükle
    await this.loadRoutes();
    
    logger.info('Application initialized successfully');
  }

  start(): void {
    this.server.start();
  }

  private async connectToDatabase(): Promise<void> {
    const mongoConnection = MongoDBConnection.getInstance();
    const dbUrl = (constants.NODE_ENV === 'production' 
      ? constants.PRODUCTION_DATABASE_URL 
      : constants.DEVELOPMENT_DATABASE_URL) as string;
    
    try {
      await mongoConnection.connect(dbUrl);
      logger.info('Connected to MongoDB successfully');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private async loadRoutes(): Promise<void> {
    try {
      const routes = this.routesFactory.createRoutes();
      
      // Rotaları server'a ekle
      routes.forEach(route => {
        this.server.addRoute(route);
      });
      
      logger.info(`${routes.length} routes loaded successfully`);
    } catch (error) {
      logger.error('Failed to load routes:', error);
      throw error;
    }
  }
}