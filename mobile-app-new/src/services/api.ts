import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../config';

const api = axios.create({
    baseURL: CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized error (e.g., logout user)
            await SecureStore.deleteItemAsync(CONFIG.AUTH_TOKEN_KEY);
        }
        return Promise.reject(error);
    }
);

export default api;
