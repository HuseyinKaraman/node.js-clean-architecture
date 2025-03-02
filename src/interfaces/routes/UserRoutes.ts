import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { validateUserRegister, validateUserLogin, validatePasswordReset, validatePasswordUpdate } from '../middlewares/ValidationMiddleware';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AdminMiddleware } from '../middlewares/AdminMiddleware';
import { IRouter } from '../interface/IRouter';
import { constants } from '../../constants';

export class UserRoutes implements IRouter {
  public router: Router;
  public path = constants.API_PREFIX!;

  constructor(private userController: UserController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Authentication routes
    this.router.post('/auth/register', validateUserRegister, this.userController.createUser.bind(this.userController));
    this.router.post('/auth/login', validateUserLogin, this.userController.login.bind(this.userController));

    // User management
    this.router.get('/auth/me', AuthMiddleware, this.userController.currentUser.bind(this.userController));
    this.router.put('/auth/me', AuthMiddleware, this.userController.updateCurrentUser.bind(this.userController));

    // Password management
    this.router.post('/auth/forgot-password', this.userController.forgotPassword.bind(this.userController));
    this.router.post('/auth/reset-password', validatePasswordReset, this.userController.resetPassword.bind(this.userController));
    this.router.post('/auth/update-password', AuthMiddleware, validatePasswordUpdate, this.userController.updatePassword.bind(this.userController));

    // Email verification
    this.router.post('/auth/send-verification', this.userController.sendVerificationEmail.bind(this.userController));
    this.router.post('/auth/verify-email', this.userController.verifyEmail.bind(this.userController));
    
    // Account deletion
    this.router.post('/auth/send-delete-account', AuthMiddleware, this.userController.sendDeleteAccountEmail.bind(this.userController));
    this.router.delete('/auth/delete-account', AuthMiddleware, this.userController.deleteAccount.bind(this.userController));

    // User management (admin only)
    this.router.get('/users', [AuthMiddleware, AdminMiddleware], this.userController.getUsers.bind(this.userController));
    this.router.get('/users/:id', [AuthMiddleware, AdminMiddleware], this.userController.getUser.bind(this.userController));
    this.router.put('/users/:id', [AuthMiddleware, AdminMiddleware], this.userController.updateUser.bind(this.userController));
    this.router.delete('/users/:id', [AuthMiddleware, AdminMiddleware], this.userController.deleteUser.bind(this.userController));
  }
}