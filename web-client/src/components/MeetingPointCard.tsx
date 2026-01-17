"use client";

import React, { useState } from "react";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import ButtonPrimary from "@/shared/ButtonPrimary";

interface MeetingPoint {
    id: string;
    type: string;
    location: any;
    sharedBy: string;
    sharedAt: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    tenantViewed: boolean;
}

interface MeetingPointCardProps {
    bookingId: string;
    meetingPoint?: MeetingPoint;
    isHunter: boolean;
    onUpdate: () => void;
}

export default function MeetingPointCard({
    bookingId,
    meetingPoint,
    isHunter,
    onUpdate,
}: MeetingPointCardProps) {
    const { showToast } = useToast();
    const [editing, setEditing] = useState(false);
    const [type, setType] = useState(meetingPoint?.type || "LANDMARK");
    const [locationName, setLocationName] = useState("");
    const [locationDetails, setLocationDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdateMeetingPoint = async () => {
        if (!locationName) {
            showToast("error", "Please enter a location name");
            return;
        }

        setLoading(true);
        try {
            const locationData = {
                name: locationName,
                details: locationDetails,
                coordinates: null,
            };

            await api.post(`/bookings/${bookingId}/meeting-point`, {
                type,
                location: locationData,
            });

            showToast("success", "Meeting point proposal sent!");
            setEditing(false);
            setLocationName("");
            setLocationDetails("");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to update meeting point");
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (action: "accept" | "reject") => {
        setLoading(true);
        try {
            await api.post(`/bookings/${bookingId}/meeting-point/respond`, { action });
            showToast("success", `Meeting point ${action}ed`);
            onUpdate();
        } catch (error: any) {
            showToast("error", "Failed to respond to meeting point");
        } finally {
            setLoading(false);
        }
    };

    const parsedLocation = meetingPoint?.location
        ? (typeof meetingPoint.location === 'string'
            ? JSON.parse(meetingPoint.location)
            : meetingPoint.location)
        : null;

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <i className="las la-map-marker-alt text-primary-600"></i>
                        Meeting Point
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isHunter ? "Propose a meeting location for the tenant" : "Meeting location for your viewing"}
                    </p>
                </div>
                {isHunter && !editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                        <i className="las la-edit mr-1"></i>
                        {meetingPoint ? "Update Proposal" : "Set Location"}
                    </button>
                )}
            </div>

            {!editing && meetingPoint ? (
                <div className="space-y-4">
                    <div className={`rounded-xl p-4 border ${meetingPoint.status === 'ACCEPTED'
                            ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800'
                            : meetingPoint.status === 'REJECTED'
                                ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800'
                                : 'bg-primary-50 border-primary-100 dark:bg-primary-900/10 dark:border-primary-800'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${meetingPoint.status === 'ACCEPTED' ? 'bg-green-600' : 'bg-primary-600'
                                }`}>
                                <i className={`las ${meetingPoint.type === 'PROPERTY' ? 'la-home' : 'la-map-marker'} text-white text-xl`}></i>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${meetingPoint.status === 'ACCEPTED'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : meetingPoint.status === 'REJECTED'
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                : 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                                        }`}>
                                        {meetingPoint.status}
                                    </span>
                                    <span className="text-xs text-neutral-500">
                                        {new Date(meetingPoint.sharedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-lg">{parsedLocation?.name || "Meeting Point"}</h4>
                                {parsedLocation?.details && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                        {parsedLocation.details}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isHunter && meetingPoint.status === 'PENDING' && (
                        <div className="flex gap-3">
                            <ButtonPrimary
                                onClick={() => handleRespond("accept")}
                                loading={loading}
                                className="flex-1"
                            >
                                <i className="las la-check mr-2"></i>
                                Accept Location
                            </ButtonPrimary>
                            <button
                                onClick={() => handleRespond("reject")}
                                disabled={loading}
                                className="flex-1 px-4 py-3 border-2 border-red-500 text-red-500 rounded-full font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Reject
                            </button>
                        </div>
                    )}

                    {isHunter && meetingPoint.status === 'PENDING' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <i className="las la-clock mr-1"></i>
                                Waiting for tenant to accept this meeting point.
                            </p>
                        </div>
                    )}
                </div>
            ) : editing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Location Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setType("LANDMARK")}
                                className={`p-4 rounded-xl border-2 transition-all ${type === "LANDMARK"
                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                                    }`}
                            >
                                <i className="las la-map-marker text-3xl mb-2"></i>
                                <p className="font-medium">Landmark</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    Meet at a nearby location
                                </p>
                            </button>
                            <button
                                onClick={() => setType("PROPERTY")}
                                className={`p-4 rounded-xl border-2 transition-all ${type === "PROPERTY"
                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                                    }`}
                            >
                                <i className="las la-home text-3xl mb-2"></i>
                                <p className="font-medium">Property</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    Meet at the property
                                </p>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Location Name *
                        </label>
                        <input
                            type="text"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            placeholder={type === "LANDMARK" ? "e.g., Shell Petrol Station, Kasarani" : "e.g., Seasons Apartments, Block A"}
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Additional Details (Optional)
                        </label>
                        <textarea
                            value={locationDetails}
                            onChange={(e) => setLocationDetails(e.target.value)}
                            placeholder="Provide directions or landmarks to help them find the location..."
                            rows={3}
                            className="w-full rounded-xl border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <ButtonPrimary
                            onClick={handleUpdateMeetingPoint}
                            loading={loading}
                            className="flex-1"
                        >
                            <i className="las la-paper-plane mr-2"></i>
                            Propose Location
                        </ButtonPrimary>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setLocationName("");
                                setLocationDetails("");
                            }}
                            className="px-6 py-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-full font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-8 text-center">
                    <i className="las la-map-marked text-5xl text-neutral-400 mb-3"></i>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        {isHunter
                            ? "No meeting point proposed yet. Click 'Set Location' to propose a meeting point."
                            : "The hunter hasn't proposed a meeting point yet."}
                    </p>
                </div>
            )}
        </div>
    );
}
