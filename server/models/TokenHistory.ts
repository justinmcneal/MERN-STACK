import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITokenHistory extends Document {
  symbol: string;
  chain: string;
  price: number;
  source: string;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenHistorySchema: Schema<ITokenHistory> = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    chain: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    source: {
      type: String,
      default: 'dexscreener',
      trim: true
    },
    collectedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

tokenHistorySchema.index({ symbol: 1, chain: 1, collectedAt: -1 });

tokenHistorySchema.index({ collectedAt: -1 });

const TokenHistory: Model<ITokenHistory> = mongoose.model<ITokenHistory>('TokenHistory', tokenHistorySchema);

export default TokenHistory;
