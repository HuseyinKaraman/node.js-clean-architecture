import { Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer'
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}

export interface Address {
  country: string; // Ülke ID'si
  state: string;   // Eyalet ID'si
  city: string;    // Şehir ID'si
  street: string;  // Cadde
  number: string;  // Numara
  postalCode: string; // Posta kodu
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: Address;
  benefits: string[];
  socialMedia?: SocialMedia;
}

export interface Location {
  latitude: string;
  longitude: string;
}

export interface User {
  id?: string;
  email: string;
  password: string;
  role: UserRole;
  company: CompanyInfo;
  location: Location;
  isFake: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}