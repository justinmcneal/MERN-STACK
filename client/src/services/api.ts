import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
      withCredentials: true, // Send cookies with requests
      timeout: 10000, // 10 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Attach CSRF token from cookie to header for non-GET requests
        if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
          const csrfToken = this.getCookie('csrfToken');
          if (csrfToken && config.headers) {
            config.headers['X-CSRF-Token'] = csrfToken;
          }
        }

        // Attach access token if available
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Handle token expiration - but not for auth endpoints
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');
        
        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
              const newTokens = await this.refreshAccessToken();
              this.isRefreshing = false;
              this.onRefreshed(newTokens.accessToken);
              // Retry original request with new token
              if (originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              }
              return this.axiosInstance(originalRequest);
            } catch (refreshError) {
              this.isRefreshing = false;
              this.onRefreshed(null); // Clear queue and log out
              return Promise.reject(refreshError);
            }
          }

          // Queue requests while token is refreshing
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest?.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<{ accessToken: string }> {
    try {
      const csrfToken = this.getCookie('csrfToken');
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        }
      );
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      return { accessToken };
    } catch (error) {
      localStorage.removeItem('accessToken');
      // Don't redirect automatically - let the app handle it gracefully
      throw error;
    }
  }

  private onRefreshed(accessToken: string | null): void {
    this.failedQueue.forEach((promise) => {
      if (accessToken) {
        promise.resolve(accessToken);
      } else {
        promise.reject('Failed to refresh token');
      }
    });
    this.failedQueue = [];
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiClient = ApiClient.getInstance().getAxiosInstance();
