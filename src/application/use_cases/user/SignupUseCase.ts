import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserRole, Address, SocialMedia, Location } from "../../../domain/entities/User";
import { UserBuilder } from "../../builder/UserBuilder";
import { IHashService } from "../../../domain/interfaces/IHashService";
import mongoose, { Types } from "mongoose";
import { BadRequestError } from "../../../interfaces/errors/BadRequestError";
import { CustomError } from "../../../interfaces/errors/CustomError";

interface SignupRequest {
  email: string;
  password: string;
  role?: UserRole;
  company: {
    name: string;
    logo?: string;
    address: Address;
    benefits: string[]; // Benefit ObjectId referansları
    socialMedia?: SocialMedia;
  };
  location: Location;
}

interface SignupResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  message?: string;
}

export class SignupUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(request: SignupRequest): Promise<SignupResponse> {
    try {
      const { email, password } = request;

      // E-posta adresinin kullanımda olup olmadığını kontrol ediyoruz
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: "Bu e-posta adresi zaten kullanımda",
        };
      }

      // Şifreyi hash'liyoruz
      const hashedPassword = await this.hashService.hash(password);

      // Yeni kullanıcı oluşturuyoruz
      const userBuilder = new UserBuilder()
        .setId(new mongoose.Types.ObjectId())
        .setEmail(request.email)
        .setPassword(hashedPassword)
        .setRole(request.role || UserRole.MERCHANT)
        .setEmailVerified(false)
        .setCreatedAt(new Date())
        .setUpdatedAt(new Date());


      const company = request.company;
      // Şirket bilgilerini ekliyoruz
        userBuilder
        .setCompanyName(company.name)
        .setAddress(company.address);

        if (company.logo) {
          userBuilder.setCompanyLogo(company.logo);
        }

        if (company.benefits && company.benefits.length > 0) {
          userBuilder.setBenefits(company.benefits);
        }

        if (company.socialMedia) {
          userBuilder.setSocialMedia(company.socialMedia);
        }

      // Konum bilgilerini ekliyoruz
      if (request.location) {
        userBuilder.setLocation(request.location);
      }

      const user = userBuilder.build();

      // Kullanıcıyı veritabanına kaydediyoruz
      const savedUser = await this.userRepository.create(user);
      if (!savedUser) {
        throw new BadRequestError("Kullanıcı oluşturulamadı.");
      }

      return {
        success: true,
        user: {
          id: savedUser.id || "",
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    } catch (error) {
      throw new BadRequestError(
        error instanceof CustomError ? error.message : "Kullanıcı oluşturulamadı."
      );
    }
  }
}
