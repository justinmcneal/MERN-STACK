import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorHandler from '../utils/errorHandler';

export interface FormData {
  email: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    const emailError = ErrorHandler.handleValidationError('email', formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Validate password
    const passwordError = ErrorHandler.handleValidationError('password', formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    // Sanitize input to prevent common errors
    let sanitizedValue = value;
    
    if (field === 'email') {
      // Remove extra spaces and convert to lowercase
      sanitizedValue = value.trim().toLowerCase();
      // Prevent multiple consecutive dots
      sanitizedValue = sanitizedValue.replace(/\.{2,}/g, '.');
    } else if (field === 'password') {
      // Remove leading/trailing spaces
      sanitizedValue = value.trim();
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Real-time validation for better UX
    if (sanitizedValue.length > 0) {
      validateField(field, sanitizedValue);
    }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    
    if (attemptCount >= 5 && timeSinceLastAttempt < 300000) { // 5 minutes
      setIsRateLimited(true);
      setErrors({ general: 'Too many failed attempts. Please wait 5 minutes before trying again.' });
      return;
    }
    
    // Reset rate limiting if enough time has passed
    if (timeSinceLastAttempt >= 300000) {
      setAttemptCount(0);
      setIsRateLimited(false);
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      
      // Reset attempt count on successful login
      setAttemptCount(0);
      navigate('/dashboard');
    } catch (error: any) {
      // Log error for debugging
      ErrorHandler.logError(error, 'Login form submission');
      
      // Increment attempt count on failure
      setAttemptCount(prev => prev + 1);
      setLastAttemptTime(Date.now());
      
      // Get user-friendly error message
      const errorMessage = ErrorHandler.createUserMessage(error);
      
      // Ensure errorMessage is always a string
      const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'An unexpected error occurred. Please try again.';
      
      // Enhanced error handling with specific guidance
      if (safeErrorMessage.includes('Please refresh the page')) {
        setErrors({ 
          general: safeErrorMessage
        });
      } else if (safeErrorMessage.includes('Invalid email or password')) {
        setErrors({ 
          general: `${safeErrorMessage} ${attemptCount >= 3 ? `(${5 - attemptCount} attempts remaining)` : ''}` 
        });
      } else if (safeErrorMessage.includes('Account temporarily locked') || safeErrorMessage.includes('too many attempts')) {
        setErrors({ general: safeErrorMessage });
        setIsRateLimited(true);
      } else if (safeErrorMessage.includes('No account found')) {
        setErrors({ general: safeErrorMessage });
      } else if (safeErrorMessage.includes('Network error') || safeErrorMessage.includes('timeout')) {
        setErrors({ general: safeErrorMessage });
      } else if (safeErrorMessage.includes('Server error')) {
        setErrors({ general: safeErrorMessage });
      } else {
        setErrors({ general: safeErrorMessage });
      }
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    formData,
    errors,
    rememberMe,
    isLoading,
    isRateLimited,
    attemptCount,
    setRememberMe,
    handleInputChange,
    handleSubmit,
    clearErrors,
    validateForm
  };
};
