"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, type, message, duration };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        const icons = {
            success: "la-check-circle",
            error: "la-times-circle",
            info: "la-info-circle",
            warning: "la-exclamation-triangle",
        };
        return icons[type];
    };

    const getColors = (type: ToastType) => {
        const colors = {
            success: "bg-green-600",
            error: "bg-red-600",
            info: "bg-blue-600",
            warning: "bg-yellow-600",
        };
        return colors[type];
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${getColors(toast.type)} text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in-right flex items-start gap-3 pointer-events-auto`}
                    >
                        <i className={`las ${getIcon(toast.type)} text-2xl flex-shrink-0`}></i>
                        <div className="flex-1">
                            <p className="font-medium">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                        >
                            <i className="las la-times text-xl"></i>
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

// Standalone Toast Component (can be used without context)
export function Toast({
    type,
    message,
    onClose
}: {
    type: ToastType;
    message: string;
    onClose: () => void;
}) {
    const getIcon = () => {
        const icons = {
            success: "la-check-circle",
            error: "la-times-circle",
            info: "la-info-circle",
            warning: "la-exclamation-triangle",
        };
        return icons[type];
    };

    const getColors = () => {
        const colors = {
            success: "bg-green-600",
            error: "bg-red-600",
            info: "bg-blue-600",
            warning: "bg-yellow-600",
        };
        return colors[type];
    };

    return (
        <div className={`${getColors()} text-white px-6 py-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[300px]`}>
            <i className={`las ${getIcon()} text-2xl flex-shrink-0`}></i>
            <div className="flex-1">
                <p className="font-medium">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
            >
                <i className="las la-times text-xl"></i>
            </button>
        </div>
    );
}
