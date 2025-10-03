import React from 'react';

/**
 * Common types and interfaces used throughout the application
 */

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalPages: number;
  };
}

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'expired' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Theme and styling types
 */
export type Theme = 'light' | 'dark' | 'system';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

/**
 * API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  status: number;
}

/**
 * Generic error type
 */
export interface AppError {
  code: string;
  message: string;
  field?: string;
  details?: any;
  timestamp: string;
}

/**
 * Component common props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps extends BaseComponentProps {
  error?: string | AppError;
  onRetry?: () => void;
}

/**
 * Form field types
 */
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime-local';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule[];
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: any;
  helpText?: string;
}

/**
 * Validation rule type
 */
export interface ValidationRule {
  validator: (value: any) => { valid: boolean; error?: string };
  customMessage?: string;
}

/**
 * Table configuration
 */
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableConfig<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  pagination?: PaginationParams;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (record: T, index: number) => void;
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

/**
 * Chart configuration
 */
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    scales?: any;
    plugins?: any;
    [key: string]: any;
  };
}

/**
 * Notification types
 */
export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Search and filter types
 */
export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: Status[];
  category?: string[];
  [key: string]: any;
}

/**
 * Device and browser types
 */
export type Device = 'mobile' | 'tablet' | 'desktop';

export type Browser = 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';

export interface DeviceInfo {
  device: Device;
  browser: Browser;
  isTouchDevice: boolean;
  screenSize: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Keyboard and accessibility types
 */
export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
};

export interface AccessibilityConfig {
  skipLinks?: boolean;
  focusTrap?: boolean;
  announceChanges?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
}

/**
 * Analytics and tracking types
 */
export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface PageViewEvent extends AnalyticsEvent {
  page: string;
  referrer?: string;
  loadTime?: number;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  darkMode: boolean;
  notifications: boolean;
  analytics: boolean;
  beta: boolean;
  maintenance: boolean;
  [key: string]: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: Theme;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  accessibility: AccessibilityConfig;
  features: FeatureFlags;
}

/**
 * UI Component Props
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

/**
 * Generic state types
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch?: Date;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Nullable<T> = T | null;

export type Maybe<T> = T | null | undefined;