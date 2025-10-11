// hooks/useVerifyEmailForm.ts
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { AxiosError } from 'axios';

export type VerifyEmailStatus = 'verifying' | 'verified' | 'error' | 'resent' | 'pending';

interface VerifyEmailLocationState {
  email?: string;
  fromRegistration?: boolean;
  message?: string;
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ error?: { message?: string }; message?: string }>;
  
  // Handle different error response structures
  if (axiosError.response?.data?.error?.message) {
    return axiosError.response.data.error.message;
  }
  
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  return fallback;
};

export const useVerifyEmailForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const location = useLocation();
  const locationState = (location.state ?? null) as VerifyEmailLocationState | null;

  // Determine initial status based on URL parameters and state
  const getInitialStatus = (): VerifyEmailStatus => {
    if (token) {
      return 'verifying';
    }
    if (locationState?.fromRegistration) {
      return 'pending';
    }
    return 'error';
  };

  const getInitialMessage = (): string => {
    if (token) {
      return 'Verifying your email. This will only take a moment...';
    }
    if (locationState?.fromRegistration) {
      return locationState.message ||
        'We just sent a verification link to your email. Please check your inbox to complete registration.';
    }
    return 'Invalid verification link. Please check your email and try again.';
  };

  const initialStatus = getInitialStatus();
  const initialMessage = getInitialMessage();

  console.log('🔐 [useVerifyEmailForm] Initial state:', {
    token: !!token,
    status: initialStatus,
    message: initialMessage,
    fromRegistration: locationState?.fromRegistration
  });

  const [status, setStatus] = useState<VerifyEmailStatus>(initialStatus);
  const [message, setMessage] = useState(initialMessage);
  const [email, setEmail] = useState(locationState?.email ?? '');
  const [isLoading, setIsLoading] = useState<boolean>(!!token); // Start loading if we have a token

  const verifyEmail = useCallback(async () => {
    if (!token) {
      setStatus(locationState?.fromRegistration ? 'pending' : 'error');
      if (!locationState?.fromRegistration) {
        setMessage('Invalid verification link. Please check your email and try again.');
      }
      return;
    }

    try {
      setStatus('verifying');
      setIsLoading(true);
      console.log('🔐 [useVerifyEmailForm] Starting verification with token:', token);
      
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      console.log('🔐 [useVerifyEmailForm] Verification response:', response.data);
      
      setStatus('verified');
      setMessage(response.data.message || 'Email verified successfully! You can now log in.');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('🔐 [useVerifyEmailForm] Verification failed:', error);
      setStatus('error');
      setMessage(extractErrorMessage(error, 'Verification failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [locationState?.fromRegistration, navigate, token]);

  useEffect(() => {
    console.log('🔐 [useVerifyEmailForm] useEffect triggered, token:', !!token);
    if (token) {
      verifyEmail();
    }
  }, [token, verifyEmail]);

  const resendVerification = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post('/auth/resend-verification', { email });
      setStatus('resent');
      setMessage(response.data.message);
    } catch (error) {
      setStatus('error');
      setMessage(extractErrorMessage(error, 'Failed to resend verification email.'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    message,
    email,
    isLoading,
    setEmail,
    verifyEmail,
    resendVerification,
  };
};
