import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorHandler } from '../utils/errorHandler';
import ProfileService from '../services/profileService';

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

// Rate limiting constants
const CHANGE_PASSWORD_ATTEMPT_COUNT_KEY = 'changePasswordAttemptCount';
const CHANGE_PASSWORD_LAST_ATTEMPT_KEY = 'changePasswordLastAttempt';
const MAX_CHANGE_PASSWORD_ATTEMPTS = 3;
const RATE_LIMIT_DURATION = 300000; // 5 minutes

export const useChangePasswordForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
        const storedAttemptCount = localStorage.getItem(CHANGE_PASSWORD_ATTEMPT_COUNT_KEY);
        const storedLastAttempt = localStorage.getItem(CHANGE_PASSWORD_LAST_ATTEMPT_KEY);
        
        if (storedAttemptCount && storedLastAttempt) {
          const count = parseInt(storedAttemptCount, 10);
          const lastAttempt = parseInt(storedLastAttempt, 10);
          const now = Date.now();
          const timeSinceLastAttempt = now - lastAttempt;
          
          // If rate limit duration has passed, reset the rate limiting
          if (timeSinceLastAttempt >= RATE_LIMIT_DURATION) {
            localStorage.removeItem(CHANGE_PASSWORD_ATTEMPT_COUNT_KEY);
            localStorage.removeItem(CHANGE_PASSWORD_LAST_ATTEMPT_KEY);
            setAttemptCount(0);
            setLastAttemptTime(0);
            setIsRateLimited(false);
          } else {
            // Restore the rate limiting state
            setAttemptCount(count);
            setLastAttemptTime(lastAttempt);
            setIsRateLimited(count >= MAX_CHANGE_PASSWORD_ATTEMPTS);
          }
        }
      } catch (error) {
        console.error('Failed to load rate limit state from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(CHANGE_PASSWORD_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(CHANGE_PASSWORD_LAST_ATTEMPT_KEY);
      }
    };

    loadRateLimitState();
  }, []);

  const validateCurrentPassword = (password: string): string | undefined => {
    if (!password) {
      return 'Current password is required';
    }
    return undefined;
  };

  const validateNewPassword = (password: string): string | undefined => {
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

  const validateConfirmPassword = (confirmPassword: string, newPassword: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your new password';
    }
    if (confirmPassword !== newPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const handleInputChange = (field: keyof FormData) => {
    return (value: string) => {
      // Sanitize input to prevent common errors
      let sanitizedValue = value;
      
      if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
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
    
    if (field === 'currentPassword') {
      errorMessage = validateCurrentPassword(value) || '';
    } else if (field === 'newPassword') {
      errorMessage = validateNewPassword(value) || '';
    } else if (field === 'confirmPassword') {
      errorMessage = validateConfirmPassword(value, formData.newPassword) || '';
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
    const currentPasswordError = validateCurrentPassword(formData.currentPassword);
    if (currentPasswordError) {
      newErrors.currentPassword = currentPasswordError;
    }
    
    const newPasswordError = validateNewPassword(formData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.newPassword);
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
      await ProfileService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      // Success - password changed
      setIsSuccess(true);
      // Clear form data and rate limiting on success
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      localStorage.removeItem(CHANGE_PASSWORD_ATTEMPT_COUNT_KEY);
      localStorage.removeItem(CHANGE_PASSWORD_LAST_ATTEMPT_KEY);
      setAttemptCount(0);
      setLastAttemptTime(0);
      setIsRateLimited(false);
    } catch (error) {
      console.error('Change password error:', error);
      
      // Handle failed attempt
      const newAttemptCount = attemptCount + 1;
      const now = Date.now();
      
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(now);
      
      // Store in localStorage
      localStorage.setItem(CHANGE_PASSWORD_ATTEMPT_COUNT_KEY, newAttemptCount.toString());
      localStorage.setItem(CHANGE_PASSWORD_LAST_ATTEMPT_KEY, now.toString());
      
      if (newAttemptCount >= MAX_CHANGE_PASSWORD_ATTEMPTS) {
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

  const handleBackToProfile = () => {
    navigate('/profile');
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
    handleBackToProfile,
  };
};
