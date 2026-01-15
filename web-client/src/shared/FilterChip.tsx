"use client";

import React from "react";
import ButtonClose from "./ButtonClose";

export interface FilterChipProps {
    label: string;
    onRemove: () => void;
    className?: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
    label,
    onRemove,
    className = "",
}) => {
    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm ${className}`}
        >
            <span className="font-medium">{label}</span>
            <button
                onClick={onRemove}
                className="hover:bg-primary-200 dark:hover:bg-primary-900/40 rounded-full p-0.5 transition-colors"
                aria-label="Remove filter"
            >
                <i className="las la-times text-xs"></i>
            </button>
        </div>
    );
};

export default FilterChip;
