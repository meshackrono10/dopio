"use client";

import React, { useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-200 dark:border-red-800",
            icon: "las la-exclamation-triangle text-red-600",
            button: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-200 dark:border-orange-800",
            icon: "las la-exclamation-circle text-orange-600",
            button: "bg-orange-600 hover:bg-orange-700",
        },
        info: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            icon: "las la-info-circle text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700",
        },
    };

    const style = typeStyles[type];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full shadow-2xl">
                <div className={`${style.bg} border-b ${style.border} p-6`}>
                    <div className="flex items-start gap-4">
                        <i className={`${style.icon} text-3xl mt-1`}></i>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                {title}
                            </h3>
                            <p className="text-neutral-700 dark:text-neutral-300">{message}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-6 py-3 ${style.button} text-white rounded-lg transition-colors font-medium`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
