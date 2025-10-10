// models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User document
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  refreshTokens: string[];
  matchPassword(enteredPassword: string): Promise<boolean>;
  failedLoginAttempts: number;
  lockUntil: number | null;
  isLocked(): boolean;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  // Two-Factor Authentication fields
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorBackupCodes: string[];
  twoFactorVerifiedAt: Date | null;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    refreshTokens: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    // Two-Factor Authentication fields
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorBackupCodes: [{ type: String }],
    twoFactorVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Instance method to check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Hash password before save (only if modified)
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Skip re-hashing if password is already a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
