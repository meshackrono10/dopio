"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_PROPERTIES } from "@/data/mockData";

type Property = typeof MOCK_PROPERTIES[0];

interface ComparisonContextType {
    comparisonList: Property[];
    addToComparison: (property: Property) => boolean;
    removeFromComparison: (propertyId: string) => void;
    clearComparison: () => void;
    isInComparison: (propertyId: string) => boolean;
    maxCompareCount: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const STORAGE_KEY = "house_haunters_property_comparison";

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [comparisonList, setComparisonList] = useState<Property[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const maxCompareCount = 4; // Maximum properties to compare

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setComparisonList(parsed);
            }
        } catch (error) {
            console.error("Failed to load comparison list:", error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever comparisonList changes
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonList));
            } catch (error) {
                console.error("Failed to save comparison list:", error);
            }
        }
    }, [comparisonList, isLoaded]);

    const addToComparison = (property: Property): boolean => {
        if (comparisonList.length >= maxCompareCount) {
            return false; // Max limit reached
        }

        if (isInComparison(property.id)) {
            return false; // Already in comparison
        }

        setComparisonList((prev) => [...prev, property]);
        return true;
    };

    const removeFromComparison = (propertyId: string | number) => {
        setComparisonList((prev) => prev.filter((p) => p.id !== propertyId));
    };

    const clearComparison = () => {
        setComparisonList([]);
    };

    const isInComparison = (propertyId: string | number): boolean => {
        return comparisonList.some((p) => p.id === propertyId);
    };

    return (
        <ComparisonContext.Provider
            value={{
                comparisonList,
                addToComparison,
                removeFromComparison,
                clearComparison,
                isInComparison,
                maxCompareCount,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error("useComparison must be used within ComparisonProvider");
    }
    return context;
}
