import { Request, Response, NextFunction } from 'express';
import { UnAuthorizedError } from '../errors/UnAuthorizedError';
import { ExpressRequestInterface } from '../interface/ExpressRequestInterface';
import { UserRole } from '../../domain/entities/User';

export const AdminMiddleware = (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnAuthorizedError('Yetkisiz erişim');
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new UnAuthorizedError('Yönetici yetkisi gerekiyor');
  }

  next();
};