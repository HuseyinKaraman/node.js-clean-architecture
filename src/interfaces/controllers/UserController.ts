import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/NotFoundError";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import { BadRequestError } from "../errors/BadRequestError";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { UserUseCaseFactory } from "../../application/factories/UserUseCaseFactory";
import { UserRole } from "../../domain/entities/User";

export class UserController {
  private useCases: ReturnType<typeof UserUseCaseFactory.create>;

  constructor() {
    this.useCases = UserUseCaseFactory.create();
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    const { email, password, role, company, location } = req.body;

    const result = await this.useCases.createUser.execute({
      email,
      password,
      role: role || UserRole.MERCHANT,
      company,
      location,
    });

    if (!result.success || !result.user) {
      throw new BadRequestError(result.message || "Kullanıcı oluşturulamadı");
    }

    const verificationResult = await this.useCases.sendVerificationEmail.execute({ email });

    if (!verificationResult.success) {
      return res.status(201).json({
        message:
          "Kullanıcı oluşturuldu ancak doğrulama e-postası gönderilemedi. Profil sayfasından tekrar deneyebilirsiniz.",
      });
    }

    return res.status(201).json({
      message: verificationResult.message,
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const result = await this.useCases.loginUser.execute({
      email,
      password,
    });

    if (!result.success) {
      throw new UnAuthorizedError(result.message || "Geçersiz e-posta adresi veya şifre");
    }

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const user = await this.useCases.getUser.execute(id);
    if (!user) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }

    return res.status(200).json(user);
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    const users = await this.useCases.getUsers.execute();
    return res.status(200).json(users);
  }

  async currentUser(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new UnAuthorizedError("Yetkisiz erişim");
    }

    const user = await this.useCases.getUser.execute(req.user.id as string);
    if (!user) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      company: user.company,
      location: user.location,
      emailVerified: user.emailVerified,
    });
  }

  async updateCurrentUser(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const updateData = req.body;

    const user = await this.useCases.getUser.execute(userId);
    if (!user) {
      throw new NotFoundError("Kullanıcı bulunamadı");
    }

    const result = await this.useCases.updateUser.execute(user.id!, updateData);
    if (!result.user) {
      throw new BadRequestError("Kullanıcı güncellenemedi");
    }

    return res.status(200).json({
      message: "Kullanıcı bilgileri başarıyla güncellendi",
      user: result.user,
    });
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updateData = req.body;

    const result = await this.useCases.updateUser.execute(id, updateData);
    if (!result) {
      throw new NotFoundError("Kullanıcı bulunamadı veya güncellenemedi");
    }

    return res.status(200).json(result);
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const result = await this.useCases.deleteUser.execute(id);

    if (!result) {
      throw new NotFoundError("Kullanıcı bulunamadı veya silinemedi");
    }

    return res.status(200).json({ message: "Kullanıcı başarıyla silindi" });
  }

  async sendDeleteAccountEmail(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const { id } = req.user!;

    await this.useCases.sendDeleteAccountEmail.execute({ id });

    return res.status(200).json({ message: "Hesap silme onay kodu mail adresine gönderildi" });
  }

  async deleteAccount(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const { id } = req.user!;
    const { code } = req.body;

    const result = await this.useCases.deleteAccount.execute({
      code,
      userId: id,
    });

    if (!result) {
      throw new NotFoundError("Kullanıcı bulunamadı veya silinemedi");
    }

    return res.status(200).json({ message: "Kullanıcı başarıyla silindi" });
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      throw new BadRequestError("Kullanıcı ID, mevcut şifre ve yeni şifre gereklidir");
    }

    const result = await this.useCases.updatePassword.execute({
      userId,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    return res.status(200).json({ message: result.message });
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    const result = await this.useCases.forgotPassword.execute({ email });

    // Güvenlik için her zaman başarılı mesajı dönüyoruz
    return res.status(200).json({ message: result.message });
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      throw new BadRequestError("Token ve yeni şifre gereklidir");
    }

    const result = await this.useCases.resetPassword.execute({
      code,
      newPassword,
    });

    if (!result.success) {
      throw new BadRequestError(result.message);
    }

    return res.status(200).json({ message: result.message });
  }

  async sendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    const result = await this.useCases.sendVerificationEmail.execute({ email });

    if (!result.success) {
      throw new BadRequestError(result.message || "Doğrulama e-postası gönderilemedi");
    }

    return res.status(200).json({ message: result.message });
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      throw new BadRequestError("Geçersiz token");
    }

    try {
      const result = await this.useCases.verifyEmail.execute({ code });

      if (!result.success) {
        throw new BadRequestError(result.message || "E-posta doğrulanamadı");
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      throw new BadRequestError("E-posta doğrulama başarısız oldu");
    }
  }
}
