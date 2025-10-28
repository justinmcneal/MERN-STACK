import { SUPPORTED_TOKENS } from '../config/tokens';

export const PREFERENCE_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'PHP'] as const;
export type PreferenceCurrency = (typeof PREFERENCE_CURRENCIES)[number];

export interface AlertThresholds {
  minProfit: number;
  maxGasCost: number;
  minROI: number;
  minScore: number;
}

export interface NotificationSettings {
  email: boolean;
  dashboard: boolean;
}

export const defaultAlertThresholds = (): AlertThresholds => ({
  minProfit: 10,
  maxGasCost: 50,
  minROI: 1,
  minScore: 0.7,
});

export const defaultNotificationSettings = (): NotificationSettings => ({
  email: true,
  dashboard: true,
});

export const DEFAULT_REFRESH_INTERVAL = 30;
export const DEFAULT_CURRENCY: PreferenceCurrency = 'USD';
export const MAX_MANUAL_MONITORING_MINUTES = 1440;

export const buildDefaultPreferences = (
  userId: string,
  currency: PreferenceCurrency = DEFAULT_CURRENCY,
  tokens: readonly string[] = SUPPORTED_TOKENS
) => ({
  userId,
  tokensTracked: Array.from(tokens),
  alertThresholds: defaultAlertThresholds(),
  notificationSettings: defaultNotificationSettings(),
  refreshInterval: DEFAULT_REFRESH_INTERVAL,
  currency,
  manualMonitoringMinutes: null,
});
