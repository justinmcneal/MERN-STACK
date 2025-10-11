import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';
import { ErrorHandler } from '../utils/errorHandler';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

// Rate limiting constants
const FORGOT_PASSWORD_ATTEMPT_COUNT_KEY = 'forgotPasswordAttemptCount';
const FORGOT_PASSWORD_LAST_ATTEMPT_KEY = 'forgotPasswordLastAttempt';
const MAX_FORGOT_PASSWORD_ATTEMPTS = 3;
const RATE_LIMIT_DURATION = 300000; // 5 minutes

export const useForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Load rate limiting state from localStorage on component mount
  useEffect(() => {
    const loadRateLimitState = () => {
      try {
        const storedAttemptCount = localStorage.getItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY);
        const storedLastAttempt = localStorage.getItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY);
        
        if (storedAttemptCount && storedLastAttempt) {
          const count = parseInt(storedAttemptCount, 10);
          const lastAttempt = parseInt(storedLastAttempt, 10);
          const now = Date.now();
          const timeSinceLastAttempt = now - lastAttempt;
          
          // If rate limit duration has passed, reset the rate limiting
          if (timeSinceLastAttempt >= RATE_LIMIT_DURATION) {
            localStorage.removeItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY);
            localStorage.removeItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY);
            setAttemptCount(0);
            setLastAttemptTime(0);
            setIsRateLimited(false);
          } else {
            // Restore the rate limiting state
            setAttemptCount(count);
            setLastAttemptTime(lastAttempt);
            setIsRateLimited(count >= MAX_FORGOT_PASSWORD_ATTEMPTS);
          }
        }
      } catch (error) {
        console.error('Failed to load rate limit state from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY);
      }
    };

    loadRateLimitState();
  }, []);

  const validateEmail = (email: string): string | undefined => {
    return ErrorHandler.handleValidationError('email', email) || undefined;
  };

  const handleInputChange = (field: keyof FormData) => {
    return (value: string) => {
      // Sanitize input to prevent common errors
      let sanitizedValue = value;
      
      if (field === 'email') {
        // Remove extra spaces and convert to lowercase
        sanitizedValue = value.trim().toLowerCase();
        // Prevent multiple consecutive dots
        sanitizedValue = sanitizedValue.replace(/\.{2,}/g, '.');
      }
      
      setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
      
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
      
      // Clear general error when user starts typing
      if (errors.general) {
        setErrors(prev => ({ ...prev, general: undefined }));
      }
      
      // Real-time validation for better UX
      if (sanitizedValue.length > 0) {
        validateField(field, sanitizedValue);
      }
    };
  };

  const validateField = (field: keyof FormData, value: string) => {
    const errorMessage = ErrorHandler.handleValidationError(field, value);
    const newErrors: FormErrors = { ...errors };
    
    if (errorMessage) {
      newErrors[field] = errorMessage;
    } else {
      delete newErrors[field];
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (isRateLimited) {
      const timeRemaining = Math.ceil((RATE_LIMIT_DURATION - (Date.now() - lastAttemptTime)) / 1000 / 60);
      setErrors({ 
        general: `Too many failed attempts. Please wait ${timeRemaining} minute${timeRemaining > 1 ? 's' : ''} before trying again.` 
      });
      return;
    }
    
    // Validate form
    const newErrors: FormErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await AuthService.forgotPassword(formData.email);
      
      if (result.success) {
        setIsSuccess(true);
        // Clear form data and rate limiting on success
        setFormData({ email: '' });
        localStorage.removeItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY);
        setAttemptCount(0);
        setLastAttemptTime(0);
        setIsRateLimited(false);
      } else {
        // Handle failed attempt
        const newAttemptCount = attemptCount + 1;
        const now = Date.now();
        
        setAttemptCount(newAttemptCount);
        setLastAttemptTime(now);
        
        // Store in localStorage
        localStorage.setItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY, newAttemptCount.toString());
        localStorage.setItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY, now.toString());
        
        if (newAttemptCount >= MAX_FORGOT_PASSWORD_ATTEMPTS) {
          setIsRateLimited(true);
          setErrors({ 
            general: `Too many failed attempts. Please wait 5 minutes before trying again.` 
          });
        } else {
          setErrors({ general: result.message || 'Failed to send password reset email' });
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Handle failed attempt
      const newAttemptCount = attemptCount + 1;
      const now = Date.now();
      
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(now);
      
      // Store in localStorage
      localStorage.setItem(FORGOT_PASSWORD_ATTEMPT_COUNT_KEY, newAttemptCount.toString());
      localStorage.setItem(FORGOT_PASSWORD_LAST_ATTEMPT_KEY, now.toString());
      
      if (newAttemptCount >= MAX_FORGOT_PASSWORD_ATTEMPTS) {
        setIsRateLimited(true);
        setErrors({ 
          general: `Too many failed attempts. Please wait 5 minutes before trying again.` 
        });
      } else {
        const errorMessage = ErrorHandler.createUserMessage(error);
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    attemptCount,
    isRateLimited,
    handleInputChange,
    handleSubmit,
    handleBackToLogin,
  };
};
