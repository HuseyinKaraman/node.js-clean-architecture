export class ResetPasswordDto {
  constructor(
    public code: string,
    public newPassword: string
  ) {}
}