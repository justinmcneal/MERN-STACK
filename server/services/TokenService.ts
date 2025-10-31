import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { AUTH_CONSTANTS } from '../constants/auth';
import { createError } from '../middleware/errorMiddleware';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE!;
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE!;

if (!process.env.JWT_SECRET || !process.env.ACCESS_TOKEN_EXPIRE || !process.env.REFRESH_TOKEN_EXPIRE) {
  throw new Error('Missing required JWT environment variables');
}

const parseExpire = (value: string): number => {
  const duration = ms(value as ms.StringValue);
  if (duration === undefined) throw new Error(`Invalid expire format: ${value}`);
  return Math.floor(duration / 1000);
};

export class TokenService {
  static generateRandomToken(bytes: number = AUTH_CONSTANTS.VERIFICATION_TOKEN_BYTES): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  static generateEmailVerificationToken(): string {
    return this.generateRandomToken();
  }

  static generatePasswordResetToken(): string {
    return this.generateRandomToken();
  }

  static getEmailVerificationExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + AUTH_CONSTANTS.TOKEN_EXPIRY_EMAIL_HOURS);
    return expiry;
  }

  static getPasswordResetExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + AUTH_CONSTANTS.TOKEN_EXPIRY_PASSWORD_HOURS);
    return expiry;
  }

  static isTokenExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static verifyToken(token: string, hash: string): boolean {
    const tokenHash = this.hashToken(token);
    return tokenHash === hash;
  }

  static generateJWT(id: string, expiresIn: string): string {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: parseExpire(expiresIn) });
  }

  static generateAccessToken(id: string): string {
    return this.generateJWT(id, ACCESS_TOKEN_EXPIRE);
  }

  static generateRefreshToken(id: string): string {
    return this.generateJWT(id, REFRESH_TOKEN_EXPIRE);
  }

  static verifyJWT(token: string): { id: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        return decoded as { id: string };
      }
      throw new Error('Invalid token structure');
    } catch (error) {
      throw createError('Invalid or expired token', 401);
    }
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(AUTH_CONSTANTS.CSRF_TOKEN_BYTES).toString('hex');
  }
}