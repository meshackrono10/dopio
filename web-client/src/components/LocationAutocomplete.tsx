"use client";

import React, { FC, useState, useCallback, useEffect } from "react";
import Input from "@/shared/Input";

interface LocationSuggestion {
    id: string;
    place_name: string;
    center: [number, number]; // [longitude, latitude]
    text: string;
}

interface LocationAutocompleteProps {
    onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void;
    defaultValue?: string;
}

// Mapbox API endpoint
const MAPBOX_API = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""; // You'll add this to .env.local

// Predefined Kenyan areas as fallback
const PREDEFINED_AREAS = [
    "Kasarani Seasons, Nairobi",
    "Kasarani Equity, Nairobi",
    "Gate A, Juja",
    "Mathare North, Nairobi",
    "Area 4, Umoja",
    "Mirema Drive, Roysambu",
    "TRM Area, Nairobi",
    "Zimmerman, Nairobi",
    "Githurai 44",
    "Ruiru, Kiambu",
];

const LocationAutocomplete: FC<LocationAutocompleteProps> = ({ onLocationSelect, defaultValue = "" }) => {
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);

    const searchLocation = useCallback(async (searchQuery: string) => {
        if (!MAPBOX_TOKEN) {
            console.warn("Mapbox token not configured. Using fallback search.");
            // Fallback to filtering predefined areas
            const filtered = PREDEFINED_AREAS
                .filter(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((area, index) => ({
                    id: `manual-${index}`,
                    place_name: area,
                    center: [-1.2921, 36.8219] as [number, number], // Default Nairobi coordinates
                    text: area,
                }));
            setSuggestions(filtered);
            setShowSuggestions(true);
            return;
        }

        setLoading(true);
        try {
            const url = `${MAPBOX_API}/${encodeURIComponent(searchQuery)}.json?` +
                `access_token=${MAPBOX_TOKEN}&` +
                `country=KE&` + // Limit to Kenya
                `proximity=36.8219,-1.2921&` + // Bias to Nairobi
                `types=place,locality,neighborhood,address&` +
                `autocomplete=true&` +
                `limit=5`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.features) {
                setSuggestions(data.features);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
            // Use fallback on error
            const filtered = PREDEFINED_AREAS
                .filter(area => area.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((area, index) => ({
                    id: `fallback-${index}`,
                    place_name: area,
                    center: [-1.2921, 36.8219] as [number, number],
                    text: area,
                }));
            setSuggestions(filtered);
            setShowSuggestions(true);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2 || showManualEntry) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            searchLocation(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, showManualEntry, searchLocation]);

    const handleSelect = (suggestion: LocationSuggestion) => {
        setQuery(suggestion.place_name);
        setShowSuggestions(false);
        onLocationSelect({
            name: suggestion.place_name,
            coordinates: suggestion.center,
        });
    };

    const toggleManualEntry = () => {
        setShowManualEntry(!showManualEntry);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    if (showManualEntry) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Enter location manually</span>
                    <button
                        type="button"
                        onClick={toggleManualEntry}
                        className="text-sm text-primary-600 hover:text-primary-700"
                    >
                        ← Back to search
                    </button>
                </div>
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Gate A, Juja or Mathare North"
                />
            </div>
        );
    }

    return (
        <div className="relative">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Start typing: Gate A, Mathare North, Area 4..."
            />
            {loading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0"
                        >
                            <div className="flex items-start">
                                <i className="las la-map-marker-alt text-xl text-primary-600 mr-3 mt-1"></i>
                                <div>
                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {suggestion.text}
                                    </div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {suggestion.place_name}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={toggleManualEntry}
                className="mt-2 text-sm text-neutral-500 hover:text-primary-600"
            >
                Can&apos;t find your location? Enter manually →
            </button>
        </div>
    );
};

export default LocationAutocomplete;
