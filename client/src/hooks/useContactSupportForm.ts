import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactSupportService from '../services/contactSupportService';

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  priorityLevel: 'Low' | 'Medium' | 'High';
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  subject?: string;
  message?: string;
  priorityLevel?: string;
  general?: string;
}

// Rate limiting constants
const CONTACT_SUPPORT_ATTEMPT_COUNT_KEY = 'contactSupportAttemptCount';
const CONTACT_SUPPORT_LAST_ATTEMPT_KEY = 'contactSupportLastAttempt';
const MAX_CONTACT_SUPPORT_ATTEMPTS = 3;
const RATE_LIMIT_DURATION = 5 * 60 * 1000; // 5 minutes

export const useContactSupportForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    subject: '',
    message: '',
    priorityLevel: 'Low'
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
      const savedAttemptCount = localStorage.getItem(CONTACT_SUPPORT_ATTEMPT_COUNT_KEY);
      const savedLastAttemptTime = localStorage.getItem(CONTACT_SUPPORT_LAST_ATTEMPT_KEY);
      
      if (savedAttemptCount && savedLastAttemptTime) {
        const count = parseInt(savedAttemptCount, 10);
        const lastAttempt = parseInt(savedLastAttemptTime, 10);
        const now = Date.now();
        
        setAttemptCount(count);
        setLastAttemptTime(lastAttempt);
        
        // Check if rate limit has expired
        if (now - lastAttempt > RATE_LIMIT_DURATION) {
          // Rate limit expired, reset
          localStorage.removeItem(CONTACT_SUPPORT_ATTEMPT_COUNT_KEY);
          localStorage.removeItem(CONTACT_SUPPORT_LAST_ATTEMPT_KEY);
          setAttemptCount(0);
          setLastAttemptTime(0);
          setIsRateLimited(false);
        } else if (count >= MAX_CONTACT_SUPPORT_ATTEMPTS) {
          setIsRateLimited(true);
        }
      }
    };

    loadRateLimitState();
  }, []);

  // Save rate limiting state to localStorage
  const saveRateLimitState = (count: number, lastAttempt: number) => {
    localStorage.setItem(CONTACT_SUPPORT_ATTEMPT_COUNT_KEY, count.toString());
    localStorage.setItem(CONTACT_SUPPORT_LAST_ATTEMPT_KEY, lastAttempt.toString());
  };

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    const fullNameError = validateRequired(formData.fullName, 'Full name');
    if (fullNameError) newErrors.fullName = fullNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const subjectError = validateRequired(formData.subject, 'Subject');
    if (subjectError) newErrors.subject = subjectError;

    const messageError = validateRequired(formData.message, 'Message');
    if (messageError) newErrors.message = messageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePriorityChange = (priority: 'Low' | 'Medium' | 'High') => {
    setFormData(prev => ({ ...prev, priorityLevel: priority }));
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
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await ContactSupportService.submitSupportTicket(formData);
      
      if (result.success) {
        setIsSuccess(true);
        // Clear form data and rate limiting on success
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          subject: '',
          message: '',
          priorityLevel: 'Low'
        });
        localStorage.removeItem(CONTACT_SUPPORT_ATTEMPT_COUNT_KEY);
        localStorage.removeItem(CONTACT_SUPPORT_LAST_ATTEMPT_KEY);
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
        saveRateLimitState(newAttemptCount, now);
        
        if (newAttemptCount >= MAX_CONTACT_SUPPORT_ATTEMPTS) {
          setIsRateLimited(true);
          setErrors({ 
            general: `Too many failed attempts. Please wait 5 minutes before trying again.` 
          });
        } else {
          setErrors({ general: result.message || 'Failed to submit support ticket' });
        }
      }
    } catch (error: any) {
      console.error('Contact support form submission error:', error);
      
      // Handle failed attempt
      const newAttemptCount = attemptCount + 1;
      const now = Date.now();
      
      setAttemptCount(newAttemptCount);
      setLastAttemptTime(now);
      
      // Store in localStorage
      saveRateLimitState(newAttemptCount, now);
      
      if (newAttemptCount >= MAX_CONTACT_SUPPORT_ATTEMPTS) {
        setIsRateLimited(true);
        setErrors({ 
          general: `Too many failed attempts. Please wait 5 minutes before trying again.` 
        });
      } else {
        setErrors({ general: error.message || 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    attemptCount,
    isRateLimited,
    handleInputChange,
    handlePriorityChange,
    handleSubmit,
    handleBackToDashboard
  };
};
