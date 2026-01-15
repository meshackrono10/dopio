/**
 * Validation Utilities
 * Common validation functions for forms and user input
 */

export const validation = {
    /**
     * Validate email format
     */
    email: (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate email and return error message
     */
    validateEmail: (email: string): string | null => {
        if (!email) {
            return 'Email is required';
        }
        if (!validation.email(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    },

    /**
     * Validate password strength
     */
    password: (password: string): boolean => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    },

    /**
     * Validate password and return error message
     */
    validatePassword: (password: string): string | null => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters';
        }
        if (!validation.password(password)) {
            return 'Password must contain uppercase, lowercase, and numbers';
        }
        return null;
    },

    /**
     * Validate Kenyan phone number
     */
    phoneKE: (phone: string): boolean => {
        // Accepts: 0712345678, +254712345678, 254712345678
        const phoneRegex = /^(\+?254|0)?[17]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    /**
     * Validate phone number and return error message
     */
    validatePhone: (phone: string): string | null => {
        if (!phone) {
            return 'Phone number is required';
        }
        if (!validation.phoneKE(phone)) {
            return 'Please enter a valid Kenyan phone number';
        }
        return null;
    },

    /**
     * Validate required field
     */
    required: (value: any): boolean => {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value !== null && value !== undefined;
    },

    /**
     * Validate required field and return error message
     */
    validateRequired: (value: any, fieldName: string): string | null => {
        if (!validation.required(value)) {
            return `${fieldName} is required`;
        }
        return null;
    },

    /**
     * Validate minimum length
     */
    minLength: (value: string, min: number): boolean => {
        return value.length >= min;
    },

    /**
     * Validate maximum length
     */
    maxLength: (value: string, max: number): boolean => {
        return value.length <= max;
    },

    /**
     * Validate number range
     */
    numberRange: (value: number, min: number, max: number): boolean => {
        return value >= min && value <= max;
    },

    /**
     * Validate number and return error message
     */
    validateNumber: (value: string, min?: number, max?: number): string | null => {
        const num = parseFloat(value);
        if (isNaN(num)) {
            return 'Please enter a valid number';
        }
        if (min !== undefined && num < min) {
            return `Value must be at least ${min}`;
        }
        if (max !== undefined && num > max) {
            return `Value must be at most ${max}`;
        }
        return null;
    },

    /**
     * Password match validation
     */
    passwordsMatch: (password: string, confirmPassword: string): boolean => {
        return password === confirmPassword;
    },

    /**
     * Validate password match and return error message
     */
    validatePasswordMatch: (password: string, confirmPassword: string): string | null => {
        if (!confirmPassword) {
            return 'Please confirm your password';
        }
        if (!validation.passwordsMatch(password, confirmPassword)) {
            return 'Passwords do not match';
        }
        return null;
    },

    /**
     * Get password strength (0-4)
     */
    getPasswordStrength: (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return Math.min(strength, 4);
    },

    /**
     * Get password strength label
     */
    getPasswordStrengthLabel: (password: string): string => {
        const strength = validation.getPasswordStrength(password);
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return labels[strength] || 'Very Weak';
    },
};
