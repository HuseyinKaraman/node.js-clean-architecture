import { IMailler } from "../interfaces/IMailer";

export class Mailler implements IMailler {
    SendEmail(to: string, product: unknown) {
        // send grid implementation
        console.log("Sending email to " + to);
        return true;
    }
}