// services/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.API_BASE_URL || 'http://localhost:5001/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      withCredentials: true, // Include cookies for authentication
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add CSRF token if available
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        // Add auth token if available
        const authToken = this.getAuthToken();
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            await this.refreshToken();
            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getCSRFToken(): string | null {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrfToken='))
      ?.split('=')[1] || null;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    // Note: Cookies are cleared by the server
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await this.client.post('/auth/refresh');
      const { accessToken } = response.data;
      this.setAuthToken(accessToken);
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data as ApiResponse<T>;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data as ApiResponse<T>;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data as ApiResponse<T>;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data as ApiResponse<T>;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data as ApiResponse<T>;
  }

  // Auth specific methods
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.post('/auth/login', { email, password });
    if (response.accessToken) {
      this.setAuthToken(response.accessToken);
    }
    return response;
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse> {
    const response = await this.post('/auth/register', { name, email, password });
    if (response.accessToken) {
      this.setAuthToken(response.accessToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return await this.get('/auth/me');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
