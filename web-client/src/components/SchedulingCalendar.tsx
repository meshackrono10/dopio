"use client";

import React, { useState } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Appointment } from "@/data/mockBookings";

const localizer = momentLocalizer(moment);

interface SchedulingCalendarProps {
    appointments: Appointment[];
    onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
    onSelectEvent?: (event: Appointment) => void;
    className?: string;
}

const SchedulingCalendar: React.FC<SchedulingCalendarProps> = ({
    appointments,
    onSelectSlot,
    onSelectEvent,
    className = "",
}) => {
    const [view, setView] = useState<View>("month");

    // Custom event styling based on status
    const eventStyleGetter = (event: Appointment) => {
        let backgroundColor = "#3b82f6"; // blue for confirmed

        switch (event.status) {
            case "pending":
                backgroundColor = "#f59e0b"; // orange
                break;
            case "confirmed":
                backgroundColor = "#10b981"; // green
                break;
            case "completed":
                backgroundColor = "#6b7280"; // gray
                break;
            case "cancelled":
                backgroundColor = "#ef4444"; // red
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: "8px",
                opacity: 0.9,
                color: "white",
                border: "none",
                display: "block",
                fontSize: "0.875rem",
                padding: "4px 8px",
            },
        };
    };

    return (
        <div className={`scheduling-calendar ${className}`}>
            <style jsx global>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                
                .rbc-header {
                    padding: 12px 6px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    background: transparent;
                    border-bottom: 2px solid #e5e7eb;
                }
                
                .dark .rbc-header {
                    border-bottom-color: #374151;
                    color: #f3f4f6;
                }
                
                .rbc-today {
                    background-color: #dbeafe;
                }
                
                .dark .rbc-today {
                    background-color: #1e3a8a;
                }
                
                .rbc-off-range-bg {
                    background-color: #f9fafb;
                }
                
                .dark .rbc-off-range-bg {
                    background-color: #111827;
                }
                
                .rbc-toolbar {
                    padding: 16px;
                    margin-bottom: 16px;
                    background: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                }
                
                .dark .rbc-toolbar {
                    background: #1f2937;
                    border-color: #374151;
                    color: #f3f4f6;
                }
                
                .rbc-toolbar button {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    background: white;
                    color: #374151;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .dark .rbc-toolbar button {
                    background: #374151;
                    border-color: #4b5563;
                    color: #f3f4f6;
                }
                
                .rbc-toolbar button:hover {
                    background: #f3f4f6;
                    border-color: #9ca3af;
                }
                
                .dark .rbc-toolbar button:hover {
                    background: #4b5563;
                }
                
                .rbc-toolbar button.rbc-active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }
                
                .dark .rbc-toolbar button.rbc-active {
                    background: #2563eb;
                    border-color: #2563eb;
                }
                
                .rbc-event {
                    cursor: pointer;
                }
                
                .rbc-event:hover {
                    opacity: 1 !important;
                }
                
                .rbc-month-view {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .dark .rbc-month-view {
                    background: #1f2937;
                    border-color: #374151;
                }
                
                .rbc-day-bg, .rbc-time-slot {
                    border-color: #e5e7eb;
                }
                
                .dark .rbc-day-bg,
                .dark .rbc-time-slot {
                    border-color: #374151;
                }
                
                .rbc-time-header-content {
                    border-left-color: #e5e7eb;
                }
                
                .dark .rbc-time-header-content {
                    border-left-color: #374151;
                }
                
                .rbc-month-row {
                    border-color: #e5e7eb;
                }
                
                .dark .rbc-month-row {
                    border-color: #374151;
                }
                
                .rbc-date-cell {
                    padding: 8px;
                }
                
                .dark .rbc-date-cell {
                    color: #f3f4f6;
                }
            `}</style>

            <div className="mb-4 flex gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6b7280" }}></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }}></div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">Cancelled</span>
                </div>
            </div>

            <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                view={view}
                onView={setView}
                onSelectSlot={onSelectSlot}
                onSelectEvent={onSelectEvent}
                selectable
                eventPropGetter={eventStyleGetter}
                popup
            />
        </div>
    );
};

export default SchedulingCalendar;
