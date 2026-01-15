"use client";

import React, { useState } from "react";

interface ResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (resolution: string) => void;
    disputeTitle: string;
}

export default function ResolutionModal({
    isOpen,
    onClose,
    onSubmit,
    disputeTitle,
}: ResolutionModalProps) {
    const [resolution, setResolution] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (resolution.trim()) {
            onSubmit(resolution);
            setResolution("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full shadow-2xl">
                <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 p-6">
                    <div className="flex items-start gap-4">
                        <i className="las la-check-circle text-green-600 text-3xl mt-1"></i>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Resolve Dispute
                            </h3>
                            <p className="text-neutral-700 dark:text-neutral-300">
                                {disputeTitle}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Resolution Details
                    </label>
                    <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe how this dispute was resolved..."
                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-neutral-700 dark:text-white min-h-[120px]"
                        autoFocus
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                        Provide a clear explanation of the resolution for record keeping.
                    </p>
                </div>

                <div className="p-6 flex gap-3 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!resolution.trim()}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                    >
                        Resolve Dispute
                    </button>
                </div>
            </div>
        </div>
    );
}
