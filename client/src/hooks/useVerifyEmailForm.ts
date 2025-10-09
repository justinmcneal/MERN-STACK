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
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? fallback;
};

export const useVerifyEmailForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const location = useLocation();
  const locationState = (location.state ?? null) as VerifyEmailLocationState | null;

  const initialStatus: VerifyEmailStatus = token
    ? 'verifying'
    : locationState?.fromRegistration
      ? 'pending'
      : 'error';

  const initialMessage = token
    ? 'Verifying your email. This will only take a moment...'
    : locationState?.fromRegistration
      ? locationState.message ||
        'We just sent a verification link to your email. Please check your inbox to complete registration.'
      : 'Invalid verification link. Please check your email and try again.';

  const [status, setStatus] = useState<VerifyEmailStatus>(initialStatus);
  const [message, setMessage] = useState(initialMessage);
  const [email, setEmail] = useState(locationState?.email ?? '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      setStatus('verified');
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(extractErrorMessage(error, 'Verification failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [locationState?.fromRegistration, navigate, token]);

  useEffect(() => {
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
