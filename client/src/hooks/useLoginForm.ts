import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Login form submitted with:', formData.email);
      const user = await login({
        email: formData.email,
        password: formData.password,
      });
      
      console.log('Login successful, user:', user, 'navigating to dashboard');
      // Navigate immediately since we have the user data
      navigate('/dashboard');
    } catch (error: any) {
      // Enhanced error handling
      if (error.message.includes('Invalid credentials') || error.message.includes('Invalid email or password')) {
        setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
      } else if (error.message.includes('Account locked') || error.message.includes('too many attempts')) {
        setErrors({ general: 'Account temporarily locked due to too many failed attempts. Please try again later.' });
      } else if (error.message.includes('User not found')) {
        setErrors({ general: 'No account found with this email address. Please check your email or sign up.' });
      } else if (error.message.includes('Network') || error.message.includes('timeout')) {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
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
    setRememberMe,
    handleInputChange,
    handleSubmit,
    clearErrors,
    validateForm
  };
};
