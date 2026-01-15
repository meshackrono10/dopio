import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistContextType {
    wishlist: (string | number)[];
    addToWishlist: (propertyId: string | number) => void;
    removeFromWishlist: (propertyId: string | number) => void;
    isInWishlist: (propertyId: string | number) => boolean;
    toggleWishlist: (propertyId: string | number) => void;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = '@dapio_wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<(string | number)[]>([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const savedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            }
        } catch (error) {
            console.error('Error loading wishlist:', error);
        }
    };

    const saveWishlist = async (newWishlist: (string | number)[]) => {
        try {
            await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist));
        } catch (error) {
            console.error('Error saving wishlist:', error);
        }
    };

    const addToWishlist = (propertyId: string | number) => {
        if (!wishlist.includes(propertyId)) {
            const newWishlist = [...wishlist, propertyId];
            setWishlist(newWishlist);
            saveWishlist(newWishlist);
        }
    };

    const removeFromWishlist = (propertyId: string | number) => {
        const newWishlist = wishlist.filter(id => id !== propertyId);
        setWishlist(newWishlist);
        saveWishlist(newWishlist);
    };

    const isInWishlist = (propertyId: string | number) => {
        return wishlist.includes(propertyId);
    };

    const toggleWishlist = (propertyId: string | number) => {
        if (isInWishlist(propertyId)) {
            removeFromWishlist(propertyId);
        } else {
            addToWishlist(propertyId);
        }
    };

    const clearWishlist = () => {
        setWishlist([]);
        saveWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            clearWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
