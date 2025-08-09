"use client";

import { useState } from "react";

interface ValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    match?: string;
}

interface FormErrors {
    [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    validationRules: Record<keyof T, ValidationRules>
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        Object.entries(validationRules).forEach(([fieldName, rules]) => {
            const value = values[fieldName];

            // Required field validation
            if (rules.required && !value) {
                newErrors[fieldName] = `${fieldName} is required`;
                isValid = false;
            }

            // Skip other validations if field is empty and not required
            if (!value && !rules.required) return;

            // Min length validation
            if (rules.minLength && value.length < rules.minLength) {
                newErrors[fieldName] = `${fieldName} must be at least ${rules.minLength} characters`;
                isValid = false;
            }

            // Max length validation
            if (rules.maxLength && value.length > rules.maxLength) {
                newErrors[fieldName] = `${fieldName} must be less than ${rules.maxLength} characters`;
                isValid = false;
            }

            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                newErrors[fieldName] = `${fieldName} is not valid`;
                isValid = false;
            }

            // Match validation (for password confirmation)
            if (rules.match && value !== values[rules.match]) {
                newErrors[fieldName] = `${fieldName} does not match ${rules.match}`;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (callback: () => void) => {
        return (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);

            if (validate()) {
                callback();
            }

            setIsSubmitting(false);
        };
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        setValues,
    };
}
