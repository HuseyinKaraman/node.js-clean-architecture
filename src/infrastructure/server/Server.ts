import express, { Application } from "express";
import http from "http";
import { errorHandlerMiddleware } from "../../interfaces/middlewares/ErrorHandlerMiddleware";
import { IRouter } from "../../interfaces/interface/IRouter";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "../../interfaces/logger/Logger";
import helmet from "helmet";
import { setupSwagger } from "../../config/swagger";

export class Server {
  private app: Application;
  private httpServer: http.Server;
  private routes: IRouter[] = [];

  constructor(private port: number) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.setupMiddleware();
    setupSwagger(this.app as express.Express)
  }

  private setupMiddleware(): void {
    this.app.use(cookieParser());
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: "*",
        // [
        //   process.env.CLIENT_URL as string,
        //   process.env.CLIENT_DEPLOY_URL as string,
        // ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  public addRoute(route: IRouter): void {
    this.routes.push(route);
    this.app.use(route.path, route.router);
  }

  public setupRoutes(): void {
    // Tüm route'ları ekle
    this.routes.forEach((route) => {
      this.app.use(route.path, route.router);
    });

    // Error handling middleware en son eklenmeli
    this.app.use(errorHandlerMiddleware);
  }

  public start(): void {
    this.setupRoutes();

    this.httpServer.listen(this.port, () => {
      logger.info(`Server running on port ${this.port}`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
