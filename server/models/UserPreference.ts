// models/UserPreference.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// Interface for UserPreference document
export interface IUserPreference extends Document {
  _id: string;
  userId: Types.ObjectId;
  tokensTracked: string[];
  alertThresholds: {
    minProfit: number;
    maxGasCost: number;
    minROI: number;
    minScore: number;
  };
  notificationSettings: {
    email: boolean;
    dashboard: boolean;
    telegram?: boolean;
    discord?: boolean;
  };
  refreshInterval: number; // in seconds
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
}

const userPreferenceSchema: Schema<IUserPreference> = new mongoose.Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true,
      index: true 
    },
    tokensTracked: [{ 
      type: String,
      uppercase: true 
    }],
    alertThresholds: {
      minProfit: { 
        type: Number, 
        default: 10, // $10 minimum profit
        min: 0 
      },
      maxGasCost: { 
        type: Number, 
        default: 50, // $50 maximum gas cost
        min: 0 
      },
      minROI: { 
        type: Number, 
        default: 5, // 5% minimum ROI
        min: 0 
      },
      minScore: { 
        type: Number, 
        default: 0.7, // 70% minimum ML score
        min: 0,
        max: 1 
      }
    },
    notificationSettings: {
      email: { 
        type: Boolean, 
        default: true 
      },
      dashboard: { 
        type: Boolean, 
        default: true 
      },
      telegram: { 
        type: Boolean, 
        default: false 
      },
      discord: { 
        type: Boolean, 
        default: false 
      }
    },
    refreshInterval: { 
      type: Number, 
      default: 30, // 30 seconds
      min: 5,
      max: 300 
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'auto'],
      default: 'auto' 
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'PHP'],
      default: 'USD'
    }
  },
  { 
    timestamps: true 
  }
);


// Pre-save middleware to ensure tokens are uppercase
userPreferenceSchema.pre('save', function(next) {
  this.tokensTracked = this.tokensTracked.map((token: string) => token.toUpperCase());
  next();
});

const UserPreference: Model<IUserPreference> = mongoose.model<IUserPreference>('UserPreference', userPreferenceSchema);
export default UserPreference;
