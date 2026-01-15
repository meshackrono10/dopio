import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { UserVerificationStatus } from '../data/types';
import api from '../services/api';
import { CONFIG } from '../config';

export type UserRole = 'admin' | 'tenant' | 'hunter';

export interface User {
    id: string;
    email?: string;
    phoneNumber: string;
    name: string;
    role: UserRole;
    avatar?: string;
    googleId?: string;
    twoFactorEnabled: boolean;
    phoneVerified: boolean;
    verificationStatus?: UserVerificationStatus;
    idFront?: string;
    idBack?: string;
    selfie?: string;
    verificationSubmittedAt?: string;
    verificationReviewedAt?: string;
    rejectionReason?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithPhone: (phone: string, password: string) => Promise<boolean>;
    signup: (data: SignupData) => Promise<boolean>;
    signupWithGoogle: (googleToken: string, phoneNumber: string, name: string, role: UserRole) => Promise<boolean>;
    logout: () => Promise<void>;
    switchRole: (role: UserRole) => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    deleteAccount: () => Promise<void>;
    submitVerification: (idFront: string, idBack: string, selfie: string) => Promise<boolean>;
    sendOTP: (phone: string) => Promise<boolean>;
    verifyOTP: (phone: string, otp: string) => Promise<boolean>;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

interface SignupData {
    email?: string;
    phoneNumber: string;
    password: string;
    name: string;
    role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await SecureStore.getItemAsync(CONFIG.AUTH_TOKEN_KEY);
            const storedUser = await SecureStore.getItemAsync(CONFIG.USER_DATA_KEY);

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                // Optionally verify token with backend here
                // const response = await api.get('/auth/me');
                // setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            clearError();
            setLoading(true);

            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;

            // Map backend user to frontend User interface
            const mappedUser: User = {
                ...userData,
                phoneNumber: userData.phone || '',
                role: userData.role.toLowerCase() as UserRole,
                twoFactorEnabled: false,
                phoneVerified: true,
            };

            setUser(mappedUser);
            await SecureStore.setItemAsync(CONFIG.AUTH_TOKEN_KEY, token);
            await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(mappedUser));

            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loginWithPhone = async (phone: string, password: string): Promise<boolean> => {
        // For now, backend only supports email login. 
        // We could update backend to support phone login as well.
        setError('Phone login not supported yet. Please use email.');
        return false;
    };

    const signup = async (data: SignupData): Promise<boolean> => {
        try {
            clearError();
            setLoading(true);

            const response = await api.post('/auth/register', {
                email: data.email,
                password: data.password,
                name: data.name,
                phone: data.phoneNumber,
                role: data.role.toUpperCase(),
            });

            const { token, user: userData } = response.data;

            const mappedUser: User = {
                ...userData,
                phoneNumber: userData.phone || '',
                role: userData.role.toLowerCase() as UserRole,
                twoFactorEnabled: false,
                phoneVerified: false,
            };

            setUser(mappedUser);
            await SecureStore.setItemAsync(CONFIG.AUTH_TOKEN_KEY, token);
            await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(mappedUser));

            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Signup failed';
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const signupWithGoogle = async (
        googleToken: string,
        phoneNumber: string,
        name: string,
        role: UserRole
    ): Promise<boolean> => {
        // Placeholder for Google Sign-In integration
        setError('Google Sign-In not implemented in backend yet.');
        return false;
    };

    const submitVerification = async (
        idFront: string,
        idBack: string,
        selfie: string
    ): Promise<boolean> => {
        try {
            clearError();
            setLoading(true);

            if (!user || user.role !== 'hunter') {
                setError('Only hunters can submit verification');
                return false;
            }

            // In real app, upload images to S3/Cloudinary first
            // For now, we'll send the URIs (which might be local file paths)
            await api.post('/auth/verify', { idFront, idBack, selfie });

            const updatedUser: User = {
                ...user,
                verificationStatus: 'pending',
            };

            setUser(updatedUser);
            await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(updatedUser));

            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification submission failed');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const sendOTP = async (phone: string): Promise<boolean> => {
        // Placeholder for OTP service
        console.log(`Sending OTP to ${phone}`);
        return true;
    };

    const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
        // Placeholder for OTP verification
        if (otp === '123456') {
            if (user) {
                const updatedUser = { ...user, phoneVerified: true };
                setUser(updatedUser);
                await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(updatedUser));
            }
            return true;
        }
        setError('Invalid OTP');
        return false;
    };

    const logout = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(CONFIG.AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(CONFIG.USER_DATA_KEY);
    };

    const switchRole = async (newRole: UserRole) => {
        if (user) {
            const updatedUser = { ...user, role: newRole };
            setUser(updatedUser);
            await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(updatedUser));
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        try {
            clearError();
            if (user) {
                // await api.patch('/auth/profile', updates);
                const updatedUser = { ...user, ...updates };
                setUser(updatedUser);
                await SecureStore.setItemAsync(CONFIG.USER_DATA_KEY, JSON.stringify(updatedUser));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Profile update failed');
            throw err;
        }
    };

    const deleteAccount = async () => {
        // await api.delete('/auth/account');
        setUser(null);
        await SecureStore.deleteItemAsync(CONFIG.AUTH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(CONFIG.USER_DATA_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                loginWithPhone,
                signup,
                signupWithGoogle,
                logout,
                switchRole,
                updateProfile,
                deleteAccount,
                submitVerification,
                sendOTP,
                verifyOTP,
                isAuthenticated: !!user,
                loading,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
