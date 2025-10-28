export const SCHEDULE_INTERVALS = {
  OPPORTUNITY_SCAN_MINUTES: 60,
  TOKEN_PRICE_UPDATE_CRON: '0 * * * *',
  GAS_PRICE_UPDATE_CRON: '0 * * * *',
  DATA_CLEANUP_CRON: '0 * * * *',
} as const;

export const DATA_RETENTION = {
  HISTORY_DAYS: 7,
  ALERT_DAYS: 30,
} as const;
