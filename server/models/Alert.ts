import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAlert extends Document {
  _id: string;
  userId: Types.ObjectId;
  opportunityId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
  alertType: 'opportunity' | 'price' | 'system' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: {
    tokenSymbol?: string;
    chainFrom?: string;
    chainTo?: string;
    profit?: number;
    roi?: number;
  };
}

const alertSchema: Schema<IAlert> = new mongoose.Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    opportunityId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Opportunity'
    },
    message: { 
      type: String, 
      required: true,
      maxlength: 500 
    },
    isRead: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now,
      index: true 
    },
    alertType: { 
      type: String, 
      enum: ['opportunity', 'price', 'system', 'custom'],
      default: 'opportunity',
      index: true 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true 
    },
    metadata: {
      tokenSymbol: { 
        type: String,
        uppercase: true 
      },
      chainFrom: { 
        type: String,
        lowercase: true 
      },
      chainTo: { 
        type: String,
        lowercase: true 
      },
      profit: { 
        type: Number 
      },
      roi: { 
        type: Number 
      }
    }
  },
  { 
    timestamps: true 
  }
);

alertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ userId: 1, alertType: 1, createdAt: -1 });
alertSchema.index({ userId: 1, priority: 1, createdAt: -1 });
alertSchema.index({ opportunityId: 1 });

const Alert: Model<IAlert> = mongoose.model<IAlert>('Alert', alertSchema);
export default Alert;
