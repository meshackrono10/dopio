"use client";

import React, { useState } from "react";
import { AvailabilitySlot, MOCK_AVAILABILITY } from "@/data/mockBookings";

interface AvailabilityManagerProps {
    className?: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ className = "" }) => {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>(MOCK_AVAILABILITY);
    const [bufferTime, setBufferTime] = useState(30); // minutes between appointments

    const addTimeSlot = (dayOfWeek: number) => {
        const newSlot: AvailabilitySlot = {
            id: `avail-${Date.now()}`,
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            isRecurring: true,
        };
        setAvailability([...availability, newSlot]);
    };

    const removeTimeSlot = (id: string) => {
        setAvailability(availability.filter(slot => slot.id !== id));
    };

    const updateTimeSlot = (id: string, field: string, value: string | boolean) => {
        setAvailability(availability.map(slot =>
            slot.id === id ? { ...slot, [field]: value } : slot
        ));
    };

    return (
        <div className={`availability-manager ${className}`}>
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-xl font-semibold mb-4">Manage Your Availability</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-6">
                    Set your weekly schedule and buffer time between appointments
                </p>

                {/* Buffer Time Setting */}
                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium mb-2">
                        Buffer Time Between Appointments
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="60"
                            step="15"
                            value={bufferTime}
                            onChange={(e) => setBufferTime(parseInt(e.target.value))}
                            className="flex-1"
                        />
                        <span className="text-lg font-semibold min-w-[80px]">
                            {bufferTime} min
                        </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                        Time gap between consecutive appointments for travel and preparation
                    </p>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-6">
                    {DAYS_OF_WEEK.map((day, index) => {
                        const daySlots = availability.filter(slot => slot.dayOfWeek === index);

                        return (
                            <div key={index} className="border-b border-neutral-200 dark:border-neutral-700 pb-6 last:border-0">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-lg">{day}</h4>
                                    <button
                                        onClick={() => addTimeSlot(index)}
                                        className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <i className="las la-plus mr-1"></i>
                                        Add Time Slot
                                    </button>
                                </div>

                                {daySlots.length === 0 ? (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                                        No availability set for this day
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {daySlots.map(slot => (
                                            <div
                                                key={slot.id}
                                                className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                                            >
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                                            Start Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={(e) => updateTimeSlot(slot.id, "startTime", e.target.value)}
                                                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                                                            End Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={(e) => updateTimeSlot(slot.id, "endTime", e.target.value)}
                                                            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <label className="flex items-center gap-2 text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.isRecurring}
                                                            onChange={(e) => updateTimeSlot(slot.id, "isRecurring", e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        <span className="text-neutral-600 dark:text-neutral-300">Recurring</span>
                                                    </label>
                                                </div>

                                                <button
                                                    onClick={() => removeTimeSlot(slot.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                    title="Remove time slot"
                                                >
                                                    <i className="las la-trash text-xl"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex gap-3">
                    <button className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
                        <i className="las la-save mr-2"></i>
                        Save Availability
                    </button>
                    <button className="px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl hover:border-primary-500 transition-colors font-medium">
                        <i className="las la-undo mr-2"></i>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManager;
