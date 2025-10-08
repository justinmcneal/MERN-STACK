import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorHandler from '../utils/errorHandler';

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToUpdates, setSubscribeToUpdates] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    const nameError = ErrorHandler.handleValidationError('name', formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Email validation
    const emailError = ErrorHandler.handleValidationError('email', formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Password validation
    const passwordError = ErrorHandler.handleValidationError('password', formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!agreeToTerms) {
      newErrors.general = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    // Sanitize input to prevent common errors
    let sanitizedValue = value;
    
    if (field === 'name') {
      // Remove extra spaces and capitalize first letter of each word
      sanitizedValue = value.trim().replace(/\s+/g, ' ');
      sanitizedValue = sanitizedValue.replace(/\b\w/g, l => l.toUpperCase());
    } else if (field === 'email') {
      // Remove extra spaces and convert to lowercase
      sanitizedValue = value.trim().toLowerCase();
      // Prevent multiple consecutive dots
      sanitizedValue = sanitizedValue.replace(/\.{2,}/g, '.');
    } else if (field === 'password' || field === 'confirmPassword') {
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
    
    // Special handling for confirm password
    if (field === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    if (field === 'confirmPassword') {
      if (value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      
      // Redirect to dashboard on successful registration
      navigate('/dashboard');
    } catch (error: any) {
      // Log error for debugging
      ErrorHandler.logError(error, 'Registration form submission');
      
      // Get user-friendly error message
      const errorMessage = ErrorHandler.createUserMessage(error);
      
      // Ensure errorMessage is always a string
      const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : 'Registration failed. Please try again.';
      
      // Enhanced error handling with specific guidance
      if (safeErrorMessage.includes('Email already exists') || safeErrorMessage.includes('User already exists')) {
        setErrors({ 
          general: 'An account with this email already exists. Please try logging in instead.' 
        });
      } else if (safeErrorMessage.includes('Invalid email')) {
        setErrors({ 
          general: 'Please enter a valid email address.' 
        });
      } else if (safeErrorMessage.includes('Password')) {
        setErrors({ 
          general: 'Password does not meet requirements. Please check the password criteria.' 
        });
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
    agreeToTerms,
    subscribeToUpdates,
    isLoading,
    setAgreeToTerms,
    setSubscribeToUpdates,
    handleInputChange,
    handleSubmit,
    clearErrors,
    validateForm
  };
};
