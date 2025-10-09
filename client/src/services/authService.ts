import { apiClient } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  csrfToken: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ApiError {
  error: string;
  stack?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<{ accessToken: string }> {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      // Even if logout fails on server, clear local data
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Clear all auth data
   */
  static clearAuthData(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    
    // Handle Axios errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Server responded with error status - handle different error formats
      
      // Format 1: { error: { message: "..." } } - from error middleware
      if (data?.error?.message) {
        return new Error(data.error.message);
      }
      
      // Format 2: { error: "Validation Error", message: "..." } - from validation middleware
      if (data?.message && typeof data.message === 'string') {
        return new Error(data.message);
      }
      
      // Format 3: { error: "string" } - direct error string
      if (data?.error && typeof data.error === 'string') {
        return new Error(data.error);
      }
      
      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          return new Error('Invalid request. Please check your input.');
        case 401:
          return new Error('Invalid email or password');
        case 403:
          return new Error('Access denied. Please contact support.');
        case 404:
          return new Error('User not found');
        case 429:
          return new Error('Too many attempts. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(`Server error (${status}). Please try again.`);
      }
    }
    
    // Handle network errors
    if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    // Handle other errors
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred. Please try again.');
  }
}

export default AuthService;
