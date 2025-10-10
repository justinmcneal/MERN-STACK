import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorHandler from '../utils/errorHandler';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Rate limiting storage keys
const ATTEMPT_COUNT_KEY = 'loginAttemptCount';
const LAST_ATTEMPT_KEY = 'loginLastAttempt';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Load rate limiting state from localStorage on component mount
  useEffect(() => {
    const loadRateLimitState = () => {
      try {
        const storedAttemptCount = localStorage.getItem(ATTEMPT_COUNT_KEY);
        const storedLastAttempt = localStorage.getItem(LAST_ATTEMPT_KEY);
        
        if (storedAttemptCount && storedLastAttempt) {
          const count = parseInt(storedAttemptCount, 10);
          const lastAttempt = parseInt(storedLastAttempt, 10);
          const now = Date.now();
          const timeSinceLastAttempt = now - lastAttempt;
          
          // If 5 minutes have passed, reset the rate limiting
          if (timeSinceLastAttempt >= 300000) { // 5 minutes
            localStorage.removeItem(ATTEMPT_COUNT_KEY);
            localStorage.removeItem(LAST_ATTEMPT_KEY);
            setAttemptCount(0);
            setLastAttemptTime(0);
            setIsRateLimited(false);
          } else {
            // Restore the rate limiting state
            setAttemptCount(count);
            setLastAttemptTime(lastAttempt);
            setIsRateLimited(count >= 5);
          }
        }
      } catch (error) {
        console.error('Failed to load rate limit state from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(ATTEMPT_COUNT_KEY);
        localStorage.removeItem(LAST_ATTEMPT_KEY);
      }
    };

    loadRateLimitState();
  }, []);

  // Save rate limiting state to localStorage whenever it changes
  const saveRateLimitState = (count: number, lastAttempt: number) => {
    try {
      if (count > 0) {
        localStorage.setItem(ATTEMPT_COUNT_KEY, count.toString());
        localStorage.setItem(LAST_ATTEMPT_KEY, lastAttempt.toString());
      } else {
        localStorage.removeItem(ATTEMPT_COUNT_KEY);
        localStorage.removeItem(LAST_ATTEMPT_KEY);
      }
    } catch (error) {
      console.error('Failed to save rate limit state to localStorage:', error);
    }
  };

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

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
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

  const validateField = (field: keyof LoginFormData, value: string) => {
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
      setLastAttemptTime(0);
      setIsRateLimited(false);
      saveRateLimitState(0, 0);
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('📝 [useLoginForm] Submitting login form...');
      console.log('📝 [useLoginForm] Form data:', {
        email: formData.email,
        hasPassword: !!formData.password,
        rememberMe: rememberMe,
        attemptCount: attemptCount
      });
      
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe,
      });
      
      console.log('📝 [useLoginForm] Login successful, redirecting to dashboard...');
      // Reset attempt count on successful login
      setAttemptCount(0);
      setLastAttemptTime(0);
      setIsRateLimited(false);
      saveRateLimitState(0, 0);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('📝 [useLoginForm] Login failed:', error);
      
      // Log error for debugging
      ErrorHandler.logError(error, 'Login form submission');
      
      // Increment attempt count on failure
      const newAttemptCount = attemptCount + 1;
      const newLastAttemptTime = Date.now();
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(newLastAttemptTime);
      saveRateLimitState(newAttemptCount, newLastAttemptTime);
      
      console.log('📝 [useLoginForm] Updated attempt count:', newAttemptCount);
      
      // Get user-friendly error message
      const errorMessage = ErrorHandler.createUserMessage(error);
      
      console.log('📝 [useLoginForm] Error message:', errorMessage);
      
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
        console.log('📝 [useLoginForm] Account locked detected, setting rate limited state');
        setErrors({ general: safeErrorMessage });
        setIsRateLimited(true);
        saveRateLimitState(newAttemptCount, newLastAttemptTime);
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

  const clearRateLimitState = () => {
    setAttemptCount(0);
    setLastAttemptTime(0);
    setIsRateLimited(false);
    saveRateLimitState(0, 0);
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
    clearRateLimitState,
    validateForm
  };
};
