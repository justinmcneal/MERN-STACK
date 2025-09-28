import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface for Token document
export interface IToken extends Document {
  _id: string;
  symbol: string;
  chain: string;
  currentPrice: number;
  lastUpdated: Date;
  name?: string;
  decimals?: number;
  contractAddress?: string;
}

const tokenSchema: Schema<IToken> = new mongoose.Schema(
  {
    symbol: { 
      type: String, 
      required: true, 
      uppercase: true,
      index: true 
    },
    chain: { 
      type: String, 
      required: true,
      lowercase: true,
      index: true 
    },
    currentPrice: { 
      type: Number, 
      required: true,
      min: 0 
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
    name: { 
      type: String 
    },
    decimals: { 
      type: Number, 
      default: 18 
    },
    contractAddress: { 
      type: String,
      lowercase: true 
    }
  },
  { 
    timestamps: true 
  }
);

// Compound index for symbol + chain uniqueness
tokenSchema.index({ symbol: 1, chain: 1 }, { unique: true });

// Index for efficient price queries
tokenSchema.index({ lastUpdated: -1 });


const Token: Model<IToken> = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
