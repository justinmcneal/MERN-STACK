import { apiClient } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  csrfToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
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
      console.log('Calling server logout endpoint');
      await apiClient.post('/auth/logout');
      console.log('Server logout successful');
    } catch (error: any) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      console.log('Clearing local authentication data');
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
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred');
  }
}

export default AuthService;
