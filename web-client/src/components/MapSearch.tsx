"use client";

import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Property {
    id: string;
    title: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    rent: number;
    bedrooms: number;
    image?: string;
}

// Mock properties with Nairobi coordinates
const MOCK_MAP_PROPERTIES: Property[] = [
    {
        id: "1",
        title: "Modern 2BR Apartment in Westlands",
        location: { lat: -1.2676, lng: 36.8070, address: "Westlands, Nairobi" },
        rent: 45000,
        bedrooms: 2,
    },
    {
        id: "2",
        title: "Luxury Villa in Karen",
        location: { lat: -1.3197, lng: 36.7076, address: "Karen, Nairobi" },
        rent: 120000,
        bedrooms: 4,
    },
    {
        id: "3",
        title: "Cozy Studio in Kilimani",
        location: { lat: -1.2921, lng: 36.7821, address: "Kilimani, Nairobi" },
        rent: 28000,
        bedrooms: 1,
    },
    {
        id: "4",
        title: "Spacious 3BR in Lavington",
        location: { lat: -1.2806, lng: 36.7763, address: "Lavington, Nairobi" },
        rent: 65000,
        bedrooms: 3,
    },
];

const MapSearch: React.FC<{ className?: string }> = ({ className = "" }) => {
    const [properties] = useState<Property[]>(MOCK_MAP_PROPERTIES);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    return (
        <div className={`map-search rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 ${className}`}>
            <MapContainer
                center={[-1.2921, 36.8219]} // Nairobi center
                zoom={12}
                style={{ height: "600px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={[property.location.lat, property.location.lng]}
                        eventHandlers={{
                            click: () => setSelectedProperty(property),
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h4 className="font-semibold mb-2">{property.title}</h4>
                                <p className="text-sm text-neutral-600 mb-1">{property.location.address}</p>
                                <p className="text-lg font-bold text-primary-600 mb-2">
                                    KES {property.rent.toLocaleString()}/mo
                                </p>
                                <p className="text-sm text-neutral-500">{property.bedrooms} Bedrooms</p>
                                <button className="mt-3 w-full px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {selectedProperty && (
                <div className="p-4 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
                    <h3 className="font-semibold text-lg mb-2">{selectedProperty.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {selectedProperty.location.address}
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-primary-600">
                            KES {selectedProperty.rent.toLocaleString()}/month
                        </p>
                        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                            View Property
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapSearch;
