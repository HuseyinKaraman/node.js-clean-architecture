export interface IMailler {
    SendEmail(to: string, product: unknown);
}