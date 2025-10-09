// models/Opportunity.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Interface for Opportunity document
export interface IOpportunity extends Document {
  _id: string;
  tokenId: Types.ObjectId;
  chainFrom: string;
  chainTo: string;
  priceDiff: number;
  gasCost: number;
  estimatedProfit: number;
  score: number;
  timestamp: Date;
  status: 'active' | 'expired' | 'executed';
  volume?: number;
  roi?: number;
  netProfit?: number;
}

const opportunitySchema: Schema<IOpportunity> = new mongoose.Schema(
  {
    tokenId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Token', 
      required: true
    },
    chainFrom: { 
      type: String, 
      required: true,
      lowercase: true
    },
    chainTo: { 
      type: String, 
      required: true,
      lowercase: true
    },
    priceDiff: { 
      type: Number, 
      required: true 
    },
    gasCost: { 
      type: Number, 
      required: true,
      min: 0 
    },
    estimatedProfit: { 
      type: Number, 
      required: true 
    },
    score: { 
      type: Number, 
      required: true,
      min: 0,
      max: 1 
    },
    timestamp: { 
      type: Date, 
      default: Date.now
    },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'executed'],
      default: 'active'
    },
    volume: { 
      type: Number,
      min: 0 
    },
    roi: { 
      type: Number 
    },
    netProfit: { 
      type: Number 
    }
  },
  { 
    timestamps: true 
  }
);

// Compound indexes for efficient queries
opportunitySchema.index({ tokenId: 1, chainFrom: 1, chainTo: 1 });
opportunitySchema.index({ score: -1, timestamp: -1 });
opportunitySchema.index({ status: 1, timestamp: -1 });
opportunitySchema.index({ estimatedProfit: -1 });


// Pre-save middleware to calculate derived fields
opportunitySchema.pre('save', function(next) {
  if (this.isModified('estimatedProfit') || this.isModified('gasCost')) {
    this.netProfit = this.estimatedProfit - this.gasCost;
    if (this.gasCost > 0) {
      this.roi = (this.netProfit / this.gasCost) * 100;
    }
  }
  next();
});

const Opportunity: Model<IOpportunity> = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);
export default Opportunity;
