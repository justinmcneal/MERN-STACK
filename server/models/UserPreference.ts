import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { SUPPORTED_TOKENS } from '../config/tokens';
import {
  PREFERENCE_CURRENCIES,
  PreferenceCurrency,
  AlertThresholds,
  NotificationSettings,
  defaultAlertThresholds,
  defaultNotificationSettings,
  DEFAULT_REFRESH_INTERVAL,
  DEFAULT_CURRENCY,
} from './userPreferenceDefaults';

const alertDefaults = defaultAlertThresholds();
const notificationDefaults = defaultNotificationSettings();

export interface IUserPreference extends Document {
  _id: string;
  userId: Types.ObjectId;
  tokensTracked: string[];
  alertThresholds: AlertThresholds;
  notificationSettings: NotificationSettings;
  refreshInterval: number;
  currency: PreferenceCurrency;
  manualMonitoringMinutes: number | null;
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
    tokensTracked: {
      type: [{ type: String, uppercase: true }],
      default: () => Array.from(SUPPORTED_TOKENS),
    },
    alertThresholds: {
      minProfit: { 
        type: Number, 
        default: alertDefaults.minProfit,
        min: 0 
      },
      maxGasCost: { 
        type: Number, 
        default: alertDefaults.maxGasCost,
        min: 0 
      },
      minROI: { 
        type: Number, 
        default: alertDefaults.minROI,
        min: 0 
      },
      minScore: { 
        type: Number, 
        default: alertDefaults.minScore,
        min: 0,
        max: 1 
      }
    },
    notificationSettings: {
      email: { 
        type: Boolean, 
        default: notificationDefaults.email 
      },
      dashboard: { 
        type: Boolean, 
        default: notificationDefaults.dashboard 
      }
    },
    refreshInterval: { 
      type: Number, 
      default: DEFAULT_REFRESH_INTERVAL,
      min: 5,
      max: 300 
    },
    currency: {
      type: String,
      enum: PREFERENCE_CURRENCIES,
      default: DEFAULT_CURRENCY
    },
    manualMonitoringMinutes: {
      type: Number,
      min: 0,
      max: 1440,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

const UserPreference: Model<IUserPreference> = mongoose.model<IUserPreference>('UserPreference', userPreferenceSchema);
export default UserPreference;
