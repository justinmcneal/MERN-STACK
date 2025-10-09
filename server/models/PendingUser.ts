// models/PendingUser.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPendingUser extends Document {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  verificationToken: string;
  verificationExpires: Date;
}

const pendingUserSchema: Schema<IPendingUser> = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    verificationToken: { type: String, required: true },
    verificationExpires: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const PendingUser: Model<IPendingUser> = mongoose.model<IPendingUser>('PendingUser', pendingUserSchema);
export default PendingUser;
