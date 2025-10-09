import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AuthService, { type User, type LoginCredentials, type RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials & { rememberMe?: boolean }) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        AuthService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials & { rememberMe?: boolean }): Promise<User> => {
    try {
      setIsLoading(true);
      
      // Validate credentials before sending
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }
      
      const response = await AuthService.login(credentials);
      setUser(response.user);
      return response.user;
    } catch (error) {
      // Re-throw the error to be handled by the form
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(data);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear user state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (AuthService.isAuthenticated()) {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      setUser(null);
      AuthService.clearAuthData();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
