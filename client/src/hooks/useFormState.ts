import { useState, useCallback } from 'react';

interface FormStateConfig<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
  setField: (field: keyof T, value: any) => void;
  setFields: (fields: Partial<T>) => void;
  reset: () => void;
  validate: () => boolean;
  setSubmitting: (submitting: boolean) => void;
}

export function useFormState<T extends Record<string, any>>({
  initialValues,
  validate
}: FormStateConfig<T>): FormState<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFields = useCallback((fields: Partial<T>) => {
    setValues(prev => ({ ...prev, ...fields }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    isSubmitting,
    isValid,
    setField,
    setFields,
    reset,
    validate: validateForm,
    setSubmitting,
  };
}

export default useFormState;
