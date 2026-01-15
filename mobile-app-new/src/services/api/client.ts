/**
 * API Client
 * Axios-based HTTP client with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../config/api.config';
import { ApiError, ApiResponse } from './types';

// Storage keys
const TOKEN_KEY = 'dapio_auth_token';
const REFRESH_TOKEN_KEY = 'dapio_refresh_token';

class ApiClient {
    private client: AxiosInstance;
    private refreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.DEFAULT_HEADERS,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle errors and token refresh
        this.client.interceptors.response.use(
            (response) => {
                return response.data;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // Handle 401 Unauthorized - Token expired
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.refreshing) {
                        // Queue request while token is refreshing
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(() => {
                                return this.client(originalRequest);
                            })
                            .catch((err) => {
                                return Promise.reject(err);
                            });
                    }

                    originalRequest._retry = true;
                    this.refreshing = true;

                    try {
                        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        // Attempt to refresh token
                        const response = await axios.post(
                            `${API_CONFIG.BASE_URL}/auth/refresh`,
                            { refreshToken }
                        );

                        const { token } = response.data;
                        await AsyncStorage.setItem(TOKEN_KEY, token);

                        // Retry all failed requests
                        this.failedQueue.forEach((promise) => {
                            promise.resolve();
                        });
                        this.failedQueue = [];

                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Token refresh failed - logout user
                        this.failedQueue.forEach((promise) => {
                            promise.reject(refreshError);
                        });
                        this.failedQueue = [];

                        await this.clearTokens();
                        // Optionally dispatch logout action or navigate to login

                        return Promise.reject(refreshError);
                    } finally {
                        this.refreshing = false;
                    }
                }

                // Transform error to ApiError format
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: AxiosError): ApiError {
        if (error.response) {
            // Server responded with error
            const data = error.response.data as any;
            return {
                message: data?.message || 'An error occurred',
                code: data?.code,
                statusCode: error.response.status,
                errors: data?.errors,
            };
        } else if (error.request) {
            // Request made but no response
            return {
                message: 'Network error. Please check your connection.',
                code: 'NETWORK_ERROR',
            };
        } else {
            // Something else happened
            return {
                message: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
            };
        }
    }

    async setAuthToken(token: string, refreshToken?: string) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    async clearTokens() {
        await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    }

    // HTTP Methods
    async get<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
        return this.client.get(url, config);
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        return this.client.post(url, data, config);
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        return this.client.put(url, data, config);
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
        return this.client.patch(url, data, config);
    }

    async delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>> {
        return this.client.delete(url, config);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
