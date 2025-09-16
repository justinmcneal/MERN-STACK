import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AxiosError, AxiosRequestConfig } from 'axios';

// User type
export interface User {
  _id: string;
  name: string;
  email: string;
}

// Context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getProfile: () => Promise<User>;
}

// Props
interface AuthProviderProps {
  children: ReactNode;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Access token persistence (localStorage)
const ACCESS_TOKEN_KEY = 'accessToken';
let accessToken: string | null = localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const getAccessToken = () => accessToken;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Refresh token logic
  const refreshAccessToken = async (): Promise<void> => {
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/refresh');
      setAccessToken(data.accessToken);
    } catch (err) {
      setUser(null);
      setAccessToken(null);
      navigate('/login');
      throw err;
    }
  };

  // Axios interceptor for automatic token refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await refreshAccessToken();
            if (accessToken && originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            }
            return api(originalRequest);
          } catch (err) {
            await logout();
            return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Initialize user and accessToken from localStorage on app load
  useEffect(() => {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const initAuth = async () => {
      try {
        const { data } = await api.get<User>('/auth/me', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
        setUser(data);
      } catch {
        try {
          await refreshAccessToken();
          const { data } = await api.get<User>('/auth/me', {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          });
          setUser(data);
        } catch {
          setUser(null);
        }
      }
    };
    initAuth();
  }, []);

  // Register
  const register = async (name: string, email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const user = { _id: data._id, name: data.name, email: data.email };
    setUser(user);
    setAccessToken(data.accessToken);
    return user;
  };

  // Login
  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post('/auth/login', { email, password });
    const user = { _id: data._id, name: data.name, email: data.email };
    setUser(user);
    setAccessToken(data.accessToken);
    return user;
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
      navigate('/login');
    }
  };

  // Get profile
  const getProfile = async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
