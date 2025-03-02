import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/BadRequestError';
import validator from 'validator';
import { CreateUserDto } from '../dtos/CreateUserDto';
import { LoginUserDto } from '../dtos/LoginUserDto';
import { ResetPasswordDto } from '../dtos/ResetPasswordDto';
import { UpdatePasswordDto } from '../dtos/UpdatePasswordDto';

// Kullanıcı kaydı validasyonu
export const validateUserRegister = (req: Request, res: Response, next: NextFunction) => {
  const {email, password, company, location } = req.body;
  const createUserDto = new CreateUserDto(email, password);
  
  if (!createUserDto.email || !createUserDto.password) {
    throw new BadRequestError('Missing required fields: email, password');
  }
  
  if (!validator.isEmail(createUserDto.email)) {
    throw new BadRequestError('Invalid email format');
  }
  
  if (!validator.isLength(createUserDto.password, { min: 6 })) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }
  
  // Company validation (if provided)
  if (company) {
    if (typeof company !== 'object') {
      throw new BadRequestError('Company must be an object');
    }
    
    if (company.postalCode && !validator.isPostalCode(company.postalCode, 'any')) {
      throw new BadRequestError('Invalid postal code format');
    }
  }
  
  // Location validation (if provided)
  if (location) {
    if (typeof location !== 'object') {
      throw new BadRequestError('Location must be an object');
    }
    
    if (location.latitude && !validator.isLatLong(`${location.latitude},0`)) {
      throw new BadRequestError('Invalid latitude format');
    }
    
    if (location.longitude && !validator.isLatLong(`0,${location.longitude}`)) {
      throw new BadRequestError('Invalid longitude format');
    }
  }
  
  next();
};

// Kullanıcı girişi validasyonu
export const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const loginUserDto = new LoginUserDto(email, password);
  
  if (!loginUserDto.email || !loginUserDto.password) {
    throw new BadRequestError('Missing required fields: email, password');
  }
  
  if (!validator.isEmail(loginUserDto.email)) {
    throw new BadRequestError('Invalid email format');
  }
  
  if (!validator.isLength(loginUserDto.password, { min: 6 })) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }
  
  next();
};

// Şifre sıfırlama validasyonu
export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const { code, newPassword } = req.body;
  const resetPasswordDto = new ResetPasswordDto(code, newPassword);
  
  if (!resetPasswordDto.code || !resetPasswordDto.newPassword) {
    throw new BadRequestError('Missing required fields: code, newPassword');
  }
  
  if (!validator.isLength(resetPasswordDto.newPassword, { min: 6 })) {
    throw new BadRequestError('New password must be at least 6 characters long');
  }
  
  if (!validator.isHexadecimal(resetPasswordDto.code) || !validator.isLength(resetPasswordDto.code, { min: 4, max: 10 })) {
    throw new BadRequestError('Invalid token format');
  }
  
  next();
};

// Şifre güncelleme validasyonu
export const validatePasswordUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { userId, currentPassword, newPassword } = req.body;
  const updatePasswordDto = new UpdatePasswordDto(userId, currentPassword, newPassword);
  
  if (!updatePasswordDto.userId || !updatePasswordDto.currentPassword || !updatePasswordDto.newPassword) {
    throw new BadRequestError('Missing required fields: userId, currentPassword, newPassword');
  }
  
  if (!validator.isMongoId(updatePasswordDto.userId)) {
    throw new BadRequestError('Invalid user ID format');
  }
  
  if (!validator.isLength(updatePasswordDto.currentPassword, { min: 6 })) {
    throw new BadRequestError('Current password must be at least 6 characters long');
  }
  
  if (!validator.isLength(updatePasswordDto.newPassword, { min: 6 })) {
    throw new BadRequestError('New password must be at least 6 characters long');
  }
  
  if (updatePasswordDto.currentPassword === updatePasswordDto.newPassword) {
    throw new BadRequestError('New password must be different from current password');
  }
  
  next();
};

// Kullanıcı güncelleme validasyonu
export const validateUserUpdate = (req: Request, res: Response, next: NextFunction) => {
  const updateData = req.body;
  
  if (Object.keys(updateData).length === 0) {
    throw new BadRequestError('No update data provided');
  }
  
  if (updateData.email && !validator.isEmail(updateData.email)) {
    throw new BadRequestError('Invalid email format');
  }

  // Company validation (if provided)
  if (updateData.company) {
    if (typeof updateData.company !== 'object') {
      throw new BadRequestError('Company must be an object');
    }
    
    if (updateData.company.postalCode && !validator.isPostalCode(updateData.company.postalCode, 'any')) {
      throw new BadRequestError('Invalid postal code format');
    }
  }
  
  // Location validation (if provided)
  if (updateData.location) {
    if (typeof updateData.location !== 'object') {
      throw new BadRequestError('Location must be an object');
    }
    
    if (updateData.location.latitude && !validator.isLatLong(`${updateData.location.latitude},0`)) {
      throw new BadRequestError('Invalid latitude format');
    }
    
    if (updateData.location.longitude && !validator.isLatLong(`0,${updateData.location.longitude}`)) {
      throw new BadRequestError('Invalid longitude format');
    }
  }
  
  next();
};

// Şifre unutma validasyonu
export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Missing required field: email');
  }
  
  if (!validator.isEmail(email)) {
    throw new BadRequestError('Invalid email format');
  }
  
  next();
};

// E-posta doğrulama istek validasyonu
export const validateVerificationRequest = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  
  if (!userId) {
    throw new BadRequestError('Missing required field: userId');
  }
  
  if (!validator.isMongoId(userId)) {
    throw new BadRequestError('Invalid user ID format');
  }
  
  next();
};

// Token doğrulama validasyonu
export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    throw new BadRequestError('Missing or invalid token');
  }
  
  if (!validator.isJWT(token)) {
    throw new BadRequestError('Invalid token format');
  }
  
  next();
};