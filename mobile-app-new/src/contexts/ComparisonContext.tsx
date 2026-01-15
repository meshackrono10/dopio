import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropertyListing } from '../data/types';

interface ComparisonContextType {
    comparisonList: PropertyListing[];
    addToComparison: (property: PropertyListing) => boolean;
    removeFromComparison: (propertyId: string) => void;
    clearComparison: () => void;
    isInComparison: (propertyId: string) => boolean;
    maxComparisonReached: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_ITEMS = 4;
const STORAGE_KEY = 'dapio_comparison_list';

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
    const [comparisonList, setComparisonList] = useState<PropertyListing[]>([]);

    // Load comparison list from AsyncStorage on mount
    useEffect(() => {
        loadComparisonList();
    }, []);

    // Save comparison list to AsyncStorage whenever it changes
    useEffect(() => {
        saveComparisonList();
    }, [comparisonList]);

    const loadComparisonList = async () => {
        try {
            const storedList = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedList) {
                setComparisonList(JSON.parse(storedList));
            }
        } catch (error) {
            console.error('Failed to load comparison list:', error);
        }
    };

    const saveComparisonList = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonList));
        } catch (error) {
            console.error('Failed to save comparison list:', error);
        }
    };

    const addToComparison = (property: PropertyListing): boolean => {
        if (comparisonList.length >= MAX_COMPARISON_ITEMS) {
            return false; // Max reached
        }

        if (isInComparison(property.id.toString())) {
            return false; // Already in list
        }

        setComparisonList([...comparisonList, property]);
        return true;
    };

    const removeFromComparison = (propertyId: string) => {
        setComparisonList(comparisonList.filter(p => p.id.toString() !== propertyId));
    };

    const clearComparison = () => {
        setComparisonList([]);
    };

    const isInComparison = (propertyId: string): boolean => {
        return comparisonList.some(p => p.id.toString() === propertyId);
    };

    return (
        <ComparisonContext.Provider
            value={{
                comparisonList,
                addToComparison,
                removeFromComparison,
                clearComparison,
                isInComparison,
                maxComparisonReached: comparisonList.length >= MAX_COMPARISON_ITEMS,
            }}
        >
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within ComparisonProvider');
    }
    return context;
}
