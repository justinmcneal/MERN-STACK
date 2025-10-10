import type { AxiosError } from 'axios';
import { apiClient } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  csrfToken: string;
  message?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  email: string;
  expiresAt: string;
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
  static async register(data: RegisterData): Promise<RegistrationResponse> {
    console.log('🌐 [AuthService] Starting registration process...');
    console.log('🌐 [AuthService] Registration data:', {
      name: data.name,
      email: data.email,
      hasPassword: !!data.password
    });
    
    try {
      console.log('🌐 [AuthService] Making API call to /auth/register...');
      const response = await apiClient.post<RegistrationResponse>('/auth/register', data);
      console.log('🌐 [AuthService] Registration API response received:', response.data);
      
      return response.data;
    } catch (error: unknown) {
      console.error('🌐 [AuthService] Registration failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('🌐 [AuthService] Starting login process...');
    console.log('🌐 [AuthService] Login credentials:', {
      email: credentials.email,
      hasPassword: !!credentials.password,
      rememberMe: credentials.rememberMe
    });
    
    try {
      console.log('🌐 [AuthService] Making API call to /auth/login...');
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      const { data: responseData } = response;
      const user = responseData?.user;

      console.log('🌐 [AuthService] Login API response received:', responseData);

      if (!user) {
        throw new Error('Login failed: missing user data in response.');
      }

      const normalizedUser: User = {
        ...user,
        isEmailVerified: Boolean(user.isEmailVerified),
      };

      if (normalizedUser.isEmailVerified) {
        localStorage.setItem('accessToken', responseData.accessToken);
      } else {
        localStorage.removeItem('accessToken');
      }

      console.log('🌐 [AuthService] Login successful for user:', user.email);
      return {
        ...responseData,
        user: normalizedUser,
      };
    } catch (error: unknown) {
      console.error('🌐 [AuthService] Login failed:', error);
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
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
  private static handleError(error: unknown): Error {
    if (this.isAxiosError(error)) {
      const { response, request, message } = error;

      if (response) {
        const { status, data } = response;

        if (data && typeof data === 'object') {
          const nestedError = (data as { error?: { message?: string } }).error;
          if (nestedError?.message) {
            return new Error(nestedError.message);
          }

          const messageField = (data as { message?: string }).message;
          if (typeof messageField === 'string') {
            return new Error(messageField);
          }

          const topLevelError = (data as ApiError).error;
          if (typeof topLevelError === 'string') {
            return new Error(topLevelError);
          }
        }

        if (typeof status === 'number') {
          switch (status) {
            case 400:
              return new Error('Invalid request. Please check your input.');
            case 401:
              return new Error('Invalid email or password');
            case 403:
              // Check if it's an account locked error
              if (data && typeof data === 'object' && (data as any).error?.message?.includes('locked')) {
                return new Error((data as any).error.message);
              }
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
      }

      if (request && !response) {
        return new Error('Network error. Please check your internet connection.');
      }

      if (message) {
        return new Error(message);
      }
    }

    if (error instanceof Error && error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred. Please try again.');
  }

  private static isAxiosError(error: unknown): error is AxiosError<ApiError> {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as { isAxiosError?: boolean }).isAxiosError === true
    );
  }
}

export default AuthService;
