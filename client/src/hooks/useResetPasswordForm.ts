import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../services/authService';
import { ErrorHandler } from '../utils/errorHandler';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Rate limiting constants
const RESET_ATTEMPT_COUNT_KEY = 'resetPasswordAttemptCount';
const RESET_LAST_ATTEMPT_KEY = 'resetPasswordLastAttempt';
const MAX_RESET_ATTEMPTS = 3;
const RATE_LIMIT_DURATION = 300000; // 5 minutes

export const useResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Load rate limiting state from localStorage on component mount
  useEffect(() => {
    const loadRateLimitState = () => {
      try {
        const storedAttemptCount = localStorage.getItem(RESET_ATTEMPT_COUNT_KEY);
        const storedLastAttempt = localStorage.getItem(RESET_LAST_ATTEMPT_KEY);
        
        if (storedAttemptCount && storedLastAttempt) {
          const count = parseInt(storedAttemptCount, 10);
          const lastAttempt = parseInt(storedLastAttempt, 10);
          const now = Date.now();
          const timeSinceLastAttempt = now - lastAttempt;
          
          // If rate limit duration has passed, reset the rate limiting
          if (timeSinceLastAttempt >= RATE_LIMIT_DURATION) {
            localStorage.removeItem(RESET_ATTEMPT_COUNT_KEY);
            localStorage.removeItem(RESET_LAST_ATTEMPT_KEY);
            setAttemptCount(0);
            setLastAttemptTime(0);
            setIsRateLimited(false);
          } else {
            // Restore the rate limiting state
            setAttemptCount(count);
            setLastAttemptTime(lastAttempt);
            setIsRateLimited(count >= MAX_RESET_ATTEMPTS);
          }
        }
      } catch (error) {
        console.error('Failed to load rate limit state from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(RESET_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(RESET_LAST_ATTEMPT_KEY);
      }
    };

    loadRateLimitState();
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setErrors({ general: 'Invalid or missing reset token. Please request a new password reset.' });
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validatePassword = (password: string): string | undefined => {
    const error = ErrorHandler.handleValidationError('password', password);
    if (error) return error;
    
    // Additional password-specific validations
    if (password.includes(' ')) {
      return 'Password cannot contain spaces';
    }
    
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
      return 'Password is too common. Please choose a more secure password.';
    }
    
    // Check for repeated characters
    if (/(.)\1{2,}/.test(password)) {
      return 'Password cannot contain more than 2 consecutive identical characters';
    }
    
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData) => {
    return (value: string) => {
      // Sanitize input to prevent common errors
      let sanitizedValue = value;
      
      if (field === 'password' || field === 'confirmPassword') {
        // Remove leading/trailing spaces
        sanitizedValue = value.trim();
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
    let errorMessage = '';
    
    if (field === 'password') {
      errorMessage = validatePassword(value) || '';
    } else if (field === 'confirmPassword') {
      errorMessage = validateConfirmPassword(value, formData.password) || '';
    }
    
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
    
    if (!token) {
      setErrors({ general: 'Invalid or missing reset token. Please request a new password reset.' });
      return;
    }

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
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await AuthService.resetPassword(token, formData.password);
      
      if (result.success) {
        setIsSuccess(true);
        // Clear form data and rate limiting
        setFormData({ password: '', confirmPassword: '' });
        localStorage.removeItem(RESET_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(RESET_LAST_ATTEMPT_KEY);
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
        localStorage.setItem(RESET_ATTEMPT_COUNT_KEY, newAttemptCount.toString());
        localStorage.setItem(RESET_LAST_ATTEMPT_KEY, now.toString());
        
        if (newAttemptCount >= MAX_RESET_ATTEMPTS) {
          setIsRateLimited(true);
          setErrors({ 
            general: `Too many failed attempts. Please wait 5 minutes before trying again.` 
          });
        } else {
          setErrors({ general: result.message || 'Failed to reset password' });
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Handle failed attempt
      const newAttemptCount = attemptCount + 1;
      const now = Date.now();
      
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(now);
      
      // Store in localStorage
      localStorage.setItem(RESET_ATTEMPT_COUNT_KEY, newAttemptCount.toString());
      localStorage.setItem(RESET_LAST_ATTEMPT_KEY, now.toString());
      
      if (newAttemptCount >= MAX_RESET_ATTEMPTS) {
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
    token,
    attemptCount,
    isRateLimited,
    handleInputChange,
    handleSubmit,
    handleBackToLogin,
  };
};
