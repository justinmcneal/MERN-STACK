import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api/api';
import { useNavigate } from 'react-router-dom';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from '../services/authToken';

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
}

// Context type
interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
}

// Props
interface AuthProviderProps {
  children: ReactNode;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();

  // Prevent multiple simultaneous refresh attempts
  let isRefreshing = false;
  const getCsrfTokenFromCookie = (): string | null => {
    const match = document.cookie.match(/(?:^|; )csrfToken=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  };
  const refreshAccessToken = async (): Promise<void> => {
    if (isRefreshing) {
      console.warn('[Auth] Refresh already in progress, skipping.');
      return;
    }
    isRefreshing = true;
    console.log('[Auth] Attempting to refresh access token...');
    try {
      const csrfToken = getCsrfTokenFromCookie();
      if (!csrfToken) {
        throw new Error('CSRF token missing from cookie');
      }
      const data = await api.post<{ accessToken: string }>('/auth/refresh', undefined, {
        headers: { 'x-csrf-token': csrfToken },
      });
      setAccessToken(data.accessToken);
      console.log('[Auth] Access token refreshed:', data.accessToken);
    } catch (err: any) {
      console.error('[Auth] Refresh token failed:', err?.response?.data || err);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
      throw err;
    } finally {
      isRefreshing = false;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout'); // clears cookie on backend
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    }
  };

  // Axios interceptor for automatic token refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _refreshTried?: boolean };
        // Only try refresh ONCE per request, and only for 401
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest._refreshTried
        ) {
          console.warn('[Auth] 401 detected, attempting refresh...');
          originalRequest._retry = true;
          originalRequest._refreshTried = true;
          try {
            await refreshAccessToken();
            const accessToken = getAccessToken();
            if (accessToken && originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            console.log('[Auth] Retrying original request after refresh.');
            return api.get(originalRequest.url!, originalRequest);
          } catch (err) {
            console.error('[Auth] Refresh failed, logging out.');
            await logout();
            return Promise.reject(err);
          }
        }
        // If already tried refresh, just reject and do not retry
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [logout]);

  // Get profile
  const getProfile = useCallback(async (): Promise<User> => {
    const accessToken = getAccessToken();
        const data = await api.get<User>('/auth/me', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
    setUser(data);
    return data;
  }, []);

  // Initialize user and accessToken from localStorage on app load
  useEffect(() => {
    const initAuth = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const hasRefreshTokenCookie = () => {
        return document.cookie.split(';').some((c) => c.trim().startsWith('refreshToken='));
      };

      if (!isLoggedIn && !hasRefreshTokenCookie()) {
        setUser(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const accessToken = getAccessToken();
        const data = await api.get<User>('/auth/me', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        setUser(data);
        localStorage.setItem('isLoggedIn', 'true');
      } catch (err: any) {
        if (hasRefreshTokenCookie()) {
          try {
            await refreshAccessToken();
        const newAccessToken = getAccessToken();
        const data = await api.get<User>('/auth/me', {
          headers: newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : undefined,
        });
            setUser(data);
            localStorage.setItem('isLoggedIn', 'true');
          } catch (refreshErr: any) {
            if (refreshErr?.response?.status === 429) {
              console.warn('[Auth] Refresh rate limited. Keeping previous user state.');
              return;
            }
            setUser(null);
            localStorage.removeItem('isLoggedIn');
          }
        } else {
          setUser(null);
          localStorage.removeItem('isLoggedIn');
        }
      } finally {
        setIsAuthReady(true);
      }
    };
    initAuth();
  }, []);

  // Register
  const register = async (name: string, email: string, password: string): Promise<User> => {
    const data: any = await api.post('/auth/register', { name, email, password });
    const user = { _id: data._id, name: data.name, email: data.email };
    setUser(user);
    setAccessToken(data.accessToken);
    localStorage.setItem('isLoggedIn', 'true');
    return user;
  };

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    const data: any = await api.post('/auth/login', { email, password });
    const user = { _id: data._id, name: data.name, email: data.email };
    setUser(user);
    setAccessToken(data.access_token);
    localStorage.setItem('isLoggedIn', 'true');
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, register, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
