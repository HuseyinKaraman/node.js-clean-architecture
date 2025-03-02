import { IRouter } from '../../interfaces/interface/IRouter';
import { UserController } from '../../interfaces/controllers/UserController';
import { UserRoutes } from '../../interfaces/routes/UserRoutes';
import { UploadController } from '../../interfaces/controllers/UploadController';
import { UploadRoutes } from '../../interfaces/routes/UploadRoutes';

export class RoutesFactory {
  createRoutes(): IRouter[] {
    // Tüm controller'ları oluştur
    const controllers = this.createControllers();
    
    // Controller'ları kullanarak route'ları oluştur
    return [
      new UserRoutes(controllers.userController),
      new UploadRoutes(controllers.uploadController),
    ];
  }

  private createControllers() {
    return {
      userController: new UserController(),
      uploadController: new UploadController(),
    };
  }
}