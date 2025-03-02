import { User } from '../entities/User';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByEmail(email: string ): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
  updatePassword(id: string, newPassword: string): Promise<boolean>;
  verifyEmail(id: string): Promise<boolean>;
  findAll(criteria?: Partial<User>): Promise<User[]>;
  updateLastLogin(id: string): Promise<boolean>;
}