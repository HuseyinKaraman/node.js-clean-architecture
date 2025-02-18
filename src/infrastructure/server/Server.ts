import express, { Application } from 'express';
import http from 'http';
import { errorHandlerMiddleware } from '../../interfaces/middlewares/ErrorHandlerMiddleware';
import { IRouter } from '../../interfaces/interface/IRouter';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from '../../interfaces/logger/Logger';

export class Server {
    private app: Application;
    private httpServer: http.Server;
    private routes: IRouter[] = [];

    constructor(private port: number) {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.setupMiddleware();
    }

    private setupMiddleware(): void {
        this.app.use(cookieParser());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    public addRoute(route: IRouter): void {
        this.routes.push(route);
        this.app.use(route.path, route.router);
    }

    public setupRoutes(): void {
        // Tüm route'ları ekle
        this.routes.forEach(route => {
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