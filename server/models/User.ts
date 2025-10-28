import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
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
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorBackupCodes: string[];
  twoFactorVerifiedAt: Date | null;
  profilePicture: string | null;
  avatar: number;
  createdAt: Date;
  updatedAt: Date;
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
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorBackupCodes: [{ type: String }],
    twoFactorVerifiedAt: { type: Date, default: null },
    profilePicture: { type: String, default: null },
    avatar: { type: Number, default: 0 },
  },
  { timestamps: true }
);
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};
const HASH_PREFIXES = ['$2a$', '$2b$', '$2y$'];
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (HASH_PREFIXES.some((prefix) => this.password.startsWith(prefix))) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
