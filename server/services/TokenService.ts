import crypto from 'crypto';

export class TokenService {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateEmailVerificationToken(): string {
    return this.generateToken();
  }

  static generatePasswordResetToken(): string {
    return this.generateToken();
  }

  static getEmailVerificationExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  }

  static getPasswordResetExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
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
}