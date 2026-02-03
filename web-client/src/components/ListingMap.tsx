"use client";

import React, { FC, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon in Next.js
// We use a local or CDN version of the icons to ensure they load correctly
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

// Special component to handle map centering when coordinates change
const ChangeView: FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

export interface ListingMapProps {
    lat: number;
    lng: number;
    isExact?: boolean;
    className?: string;
}

const ListingMap: FC<ListingMapProps> = ({
    lat,
    lng,
    isExact = false,
    className = "h-full w-full",
}) => {
    const center: [number, number] = React.useMemo(() => [lat, lng], [lat, lng]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return (
        <div className={`relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 ${className} flex items-center justify-center`}>
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            <MapContainer
                center={center}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={center} zoom={15} />

                {isExact ? (
                    <Marker position={center} />
                ) : (
                    <Circle
                        center={center}
                        radius={300}
                        pathOptions={{
                            fillColor: "#4f46e5",
                            fillOpacity: 0.2,
                            color: "#4f46e5",
                            weight: 2,
                            dashArray: "5, 10"
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default ListingMap;
