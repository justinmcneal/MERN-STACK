// hooks/useVerifyEmailForm.ts
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

export interface VerifyEmailFormData {
  email: string;
}

export const useVerifyEmailForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resending'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setStatus('resending');
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('/auth/resend-verification', { email });
      setStatus('success');
      setMessage(response.data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
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
