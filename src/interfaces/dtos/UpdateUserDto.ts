import { UserRole, CompanyInfo, Location } from '../../infrastructure/databases/mongoose/model/UserModel';

export class UpdateUserDto {
  email?: string;
  role?: UserRole;
  company?: CompanyInfo;
  location?: Location;
  isFake?: boolean;
  
  constructor(data: Partial<UpdateUserDto>) {
    Object.assign(this, data);
  }
}