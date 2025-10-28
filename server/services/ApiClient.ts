import axios from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
  accessToken?: string;
}

export class ApiClient {
  private client: any;
  private baseURL: string;

  constructor(baseURL: string = process.env.API_BASE_URL!) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config: any) => {
        const csrfToken = this.getCSRFToken();
        if (csrfToken && config.headers) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        const authToken = this.getAuthToken();
        if (authToken && config.headers) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getCSRFToken(): string | null {
    if (typeof document === 'undefined') return null;
    return document.cookie
      .split('; ')
      .find((row: string) => row.startsWith('csrfToken='))
      ?.split('=')[1] || null;
  }

  private getAuthToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private setAuthToken(token: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  private clearTokens(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('accessToken');
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

  async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response: any = await this.client.get(url, config);
    return response.data as ApiResponse<T>;
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response: any = await this.client.post(url, data, config);
    return response.data as ApiResponse<T>;
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response: any = await this.client.put(url, data, config);
    return response.data as ApiResponse<T>;
  }

  async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response: any = await this.client.delete(url, config);
    return response.data as ApiResponse<T>;
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response: any = await this.client.patch(url, data, config);
    return response.data as ApiResponse<T>;
  }

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

export const apiClient = new ApiClient();
