/**
 * Authentication API Endpoints
 */

import apiClient from '../client';
import { ENDPOINTS } from '../../../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types';

export const authApi = {
    /**
     * Login user
     */
    login: async (data: LoginRequest) => {
        const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, data);

        // Store tokens
        if (response.data.token) {
            await apiClient.setAuthToken(response.data.token, response.data.refreshToken);
        }

        return response.data;
    },

    /**
     * Register new user
     */
    register: async (data: RegisterRequest) => {
        const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, data);

        // Store tokens
        if (response.data.token) {
            await apiClient.setAuthToken(response.data.token, response.data.refreshToken);
        }

        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        await apiClient.clearTokens();
    },

    /**
     * Verify email
     */
    verifyEmail: async (token: string) => {
        return apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email: string) => {
        return apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    },

    /**
     * Reset password
     */
    resetPassword: async (token: string, password: string) => {
        return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
    },
};
