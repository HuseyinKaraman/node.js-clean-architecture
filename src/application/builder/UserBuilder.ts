import mongoose, { Types } from 'mongoose';
import { User, UserRole, Location, SocialMedia, Address } from '../../domain/entities/User';

export class UserBuilder {
  private user: User;

  constructor() {
    this.user = {
      email: '',
      password: '',
      role: UserRole.MERCHANT,
      company: {
        name: '',
        logo: '',
        address: {
          country: '',
          state: '',
          city: '',
          street: '',
          number: '',
          postalCode: ''
        },
        benefits: [],
        socialMedia: {
          instagram: '',
          facebook: '',
          whatsapp: ''
        }
      },
      location: {
        latitude: '',
        longitude: ''
      },
      isFake: false,
      emailVerified: false
    };
  }

  setId(id: mongoose.Types.ObjectId): UserBuilder {
    this.user.id = id.toString();
    return this;
  }

  setEmail(email: string): UserBuilder {
    this.user.email = email;
    return this;
  }

  setPassword(password: string): UserBuilder {
    this.user.password = password;
    return this;
  }

  setRole(role: UserRole): UserBuilder {
    this.user.role = role;
    return this;
  }

  setCompanyName(name: string): UserBuilder {
    this.user.company.name = name;
    return this;
  }

  setCompanyLogo(logo: string): UserBuilder {
    this.user.company.logo = logo;
    return this;
  }

  setAddress(address: Address): UserBuilder {
    this.user.company.address = address;
    return this;
  }

  setBenefits(benefits: string[]): UserBuilder {
    this.user.company.benefits = benefits;
    return this;
  }

  setSocialMedia(socialMedia: SocialMedia): UserBuilder {
    this.user.company.socialMedia = socialMedia;
    return this;
  }

  setLocation(location: Location): UserBuilder {
    this.user.location = location;
    return this;
  }

  setIsFake(isFake: boolean): UserBuilder {
    this.user.isFake = isFake;
    return this;
  }

  setEmailVerified(emailVerified: boolean): UserBuilder {
    this.user.emailVerified = emailVerified;
    return this;
  }

  setLastLogin(lastLogin: Date): UserBuilder {
    this.user.lastLogin = lastLogin;
    return this;
  }

  setCreatedAt(createdAt: Date): UserBuilder {
    this.user.createdAt = createdAt;
    return this;
  }

  setUpdatedAt(updatedAt: Date): UserBuilder {
    this.user.updatedAt = updatedAt;
    return this;
  }

  build(): User {
    return { ...this.user };
  }
}
