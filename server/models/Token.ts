import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IToken extends Document {
  _id: string;
  symbol: string;
  chain: string;
  currentPrice: number;
  dexPrice?: number;
  dexName?: string;
  liquidity?: number;
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
      uppercase: true
    },
    chain: { 
      type: String, 
      required: true,
      lowercase: true
    },
    currentPrice: { 
      type: Number, 
      required: true,
      min: 0 
    },
    dexPrice: {
      type: Number,
      min: 0
    },
    dexName: {
      type: String
    },
    liquidity: {
      type: Number,
      min: 0
    },
    lastUpdated: { 
      type: Date, 
      default: Date.now
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

tokenSchema.index({ symbol: 1, chain: 1 }, { unique: true });
tokenSchema.index({ lastUpdated: -1 });


const Token: Model<IToken> = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
