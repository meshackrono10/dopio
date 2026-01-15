"use client";

import React, { useState } from "react";
import { MeetingPoint } from "@/data/types";

interface NeighborhoodMapProps {
    generalArea: string;
    meetingPoints?: MeetingPoint[];
    onSelectMeetingPoint?: (point: MeetingPoint) => void;
    viewOnly?: boolean;
}

export default function NeighborhoodMap({
    generalArea,
    meetingPoints = [],
    onSelectMeetingPoint,
    viewOnly = false
}: NeighborhoodMapProps) {
    const [selectedPoint, setSelectedPoint] = useState<MeetingPoint | null>(null);

    // Mock map - in production, use Google Maps or Mapbox
    // For now, display a placeholder with meeting points

    const handleSelectPoint = (point: MeetingPoint) => {
        setSelectedPoint(point);
        if (onSelectMeetingPoint) {
            onSelectMeetingPoint(point);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden">
            {/* Map Placeholder */}
            <div className="relative bg-neutral-200 dark:bg-neutral-700 h-64 lg:h-96">
                {/* Mock map image - represents 500m radius */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="relative w-48 h-48 mx-auto">
                            {/* 500m radius circle */}
                            <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
                            <div className="absolute inset-4 border-4 border-primary-500/50 rounded-full"></div>
                            <div className="absolute inset-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <div>
                                    <i className="las la-map-marker-alt text-4xl text-primary-600"></i>
                                    <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mt-1">
                                        500m Radius
                                    </p>
                                </div>
                            </div>

                            {/* Mock meeting points on the circle */}
                            {meetingPoints.map((point, index) => {
                                const angle = (index / meetingPoints.length) * 2 * Math.PI;
                                const radius = 80; // Position on outer circle
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;

                                return (
                                    <button
                                        key={point.id}
                                        onClick={() => handleSelectPoint(point)}
                                        className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all ${selectedPoint?.id === point.id
                                                ? "bg-green-600 scale-125 shadow-lg"
                                                : point.status === "confirmed"
                                                    ? "bg-green-500"
                                                    : "bg-blue-500 hover:scale-110"
                                            }`}
                                        style={{
                                            left: `calc(50% + ${x}px)`,
                                            top: `calc(50% + ${y}px)`,
                                        }}
                                        title={point.name}
                                    >
                                        {point.status === "confirmed" && (
                                            <i className="las la-check text-white text-xs"></i>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {generalArea}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                <i className="las la-shield-alt mr-1"></i>
                                Exact location protected - 500m radius shown
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Meeting Points List */}
            {meetingPoints.length > 0 && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <h4 className="font-semibold mb-3">Meeting Points</h4>
                    <div className="space-y-2">
                        {meetingPoints.map((point) => (
                            <button
                                key={point.id}
                                onClick={() => !viewOnly && handleSelectPoint(point)}
                                disabled={viewOnly}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPoint?.id === point.id
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                                        : point.status === "confirmed"
                                            ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                                            : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                                    } ${viewOnly ? "cursor-default" : "cursor-pointer"}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${point.status === "confirmed"
                                            ? "bg-green-600"
                                            : selectedPoint?.id === point.id
                                                ? "bg-primary-600"
                                                : "bg-blue-500"
                                        }`}>
                                        <i className={`las ${point.status === "confirmed"
                                                ? "la-check"
                                                : "la-map-marker-alt"
                                            } text-white`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-semibold">{point.name}</h5>
                                            {point.status === "confirmed" && (
                                                <span className="text-xs px-2 py-0.5 bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                                                    Confirmed
                                                </span>
                                            )}
                                        </div>
                                        {point.description && (
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                {point.description}
                                            </p>
                                        )}
                                        {point.suggestedTime && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                <i className="las la-clock mr-1"></i>
                                                Suggested: {new Date(point.suggestedTime).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {!viewOnly && selectedPoint && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <i className="las la-info-circle mr-2"></i>
                                Selected: <strong>{selectedPoint.name}</strong>
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                This meeting point will be shared via in-app chat
                            </p>
                        </div>
                    )}
                </div>
            )}

            {meetingPoints.length === 0 && !viewOnly && (
                <div className="p-6 text-center">
                    <i className="las la-map-marked-alt text-4xl text-neutral-400 mb-2"></i>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        No meeting points set yet
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        The hunter will share safe meeting locations via chat
                    </p>
                </div>
            )}
        </div>
    );
}
