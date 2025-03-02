import jwt from 'jsonwebtoken';
import { ITokenService } from '../../domain/interfaces/ITokenService';
import { constants } from '../../constants';

export class JwtService implements ITokenService {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = constants.ACCESS_TOKEN_SECRET!;
    }

    async generate(payload: any): Promise<string> {
        try {
            return jwt.sign(payload, this.secretKey, { expiresIn: '1d' });
        } catch (error) {
            throw new Error('Token generation failed');
        }
    }

    async verify(token: string): Promise<any> {
        try {
            return jwt.verify(token, this.secretKey);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async decode(token: string): Promise<any> {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error('Token decode failed');
        }
    }
}