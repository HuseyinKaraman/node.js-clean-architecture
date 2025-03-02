export class UpdatePasswordDto {
  constructor(
    public userId: string,
    public currentPassword: string,
    public newPassword: string
  ) {}
}