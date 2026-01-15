"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

export type UserRole = "ADMIN" | "TENANT" | "HUNTER";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    phone?: string;
    isVerified?: boolean;
    verificationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNVERIFIED" | "NONE";
    createdAt?: string;
    updatedAt?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem("house_haunters_user");
        const token = localStorage.getItem("house_haunters_token");
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem("house_haunters_user");
                localStorage.removeItem("house_haunters_token");
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { user: loggedInUser, token } = response.data;

            setUser(loggedInUser);
            localStorage.setItem("house_haunters_user", JSON.stringify(loggedInUser));
            localStorage.setItem("house_haunters_token", token);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const signup = async (
        email: string,
        password: string,
        name: string,
        role: UserRole
    ): Promise<boolean> => {
        try {
            const response = await api.post("/auth/register", {
                email,
                password,
                name,
                role
            });
            const { user: newUser, token } = response.data;

            setUser(newUser);
            localStorage.setItem("house_haunters_user", JSON.stringify(newUser));
            localStorage.setItem("house_haunters_token", token);
            return true;
        } catch (error) {
            console.error("Signup failed:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("house_haunters_user");
        localStorage.removeItem("house_haunters_token");
    };

    // if (loading) {
    //     return (
    //         <div className="min-h-screen flex items-center justify-center">
    //             <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    //         </div>
    //     );
    // }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
