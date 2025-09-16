import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AxiosError, AxiosRequestConfig } from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  getProfile: () => Promise<User>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const navigate = useNavigate();

  // Function to refresh access token
  const refreshAccessToken = async (): Promise<string> => {
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
      setAccessToken(data.accessToken);
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } catch (err) {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      navigate('/login');
      throw err;
    }
  };

  // Initialize user on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const { data } = await api.get<User>('/auth/me');
        setUser(data);
      } catch {
        // Try to refresh token if initial request fails
        try {
          await refreshAccessToken();
          const { data } = await api.get<User>('/auth/me');
          setUser(data);
        } catch {
          setUser(null);
        }
      }
    };
    initAuth();
  }, []);

  // Axios interceptor for automatic token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshAccessToken();
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [accessToken]);

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    // Backend returns user fields and accessToken at top level
    setUser({ _id: data._id, name: data.name, email: data.email });
    setAccessToken(data.accessToken);
    localStorage.setItem('accessToken', data.accessToken);
    return { _id: data._id, name: data.name, email: data.email };
  };

  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });
    setUser({ _id: data._id, name: data.name, email: data.email });
    setAccessToken(data.accessToken);
    localStorage.setItem('accessToken', data.accessToken);
    return { _id: data._id, name: data.name, email: data.email };
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout'); // optional: clear cookie on backend
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  // Function to get user profile
  const getProfile = async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refreshAccessToken, getProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
