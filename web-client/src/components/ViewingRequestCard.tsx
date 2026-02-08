"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useToast } from "@/components/Toast";
import { Route } from "@/routers/types";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ConfirmationModal from "@/components/ConfirmationModal";
import IssueReportModal from "@/components/IssueReportModal";
import ReviewModal from "@/components/ReviewModal";

interface ViewingRequestCardProps {
    request: any;
    userRole: "HUNTER" | "TENANT";
    onUpdate: () => void;
}

export default function ViewingRequestCard({ request, userRole, onUpdate }: ViewingRequestCardProps) {
    console.log(`DEBUG: Rendering ViewingRequestCard for request ${request.id}`, { status: request.status, userRole });

    // Date diagnostics
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const rawDate = request.counterDate || (request.proposedDates && request.proposedDates[0]?.date);
    let isToday = false;
    let bDateStr = "N/A";

    if (rawDate) {
        const bDate = new Date(rawDate);
        bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
        isToday = today.getFullYear() === bDate.getFullYear() &&
            today.getMonth() === bDate.getMonth() &&
            today.getDate() === bDate.getDate();
    }

    console.log(`DEBUG: Date check for Card ${request.id}:`, { today: todayStr, scheduled: bDateStr, isToday });

    const { showToast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showCounterForm, setShowCounterForm] = useState(false);
    const [showAcceptForm, setShowAcceptForm] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [acceptLocation, setAcceptLocation] = useState("");
    const [showReportIssueModal, setShowReportIssueModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Multi-property selection (Silver/Gold)
    const [packageProperties, setPackageProperties] = useState<any[]>([]);
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [fetchingPackage, setFetchingPackage] = useState(false);

    // Unified confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        children?: React.ReactNode;
        confirmText?: string;
        onConfirm: () => void;
        confirmButtonClass?: string;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
    });

    const proposedDates = request.proposedDates || [];
    const firstDate = proposedDates[0] || {};

    const [counterDate, setCounterDate] = useState(request.counterDate ? request.counterDate.split('T')[0] : (proposedDates[0]?.date ? proposedDates[0].date.split('T')[0] : ""));
    const [counterTime, setCounterTime] = useState(request.counterTime || proposedDates[0]?.timeSlot || "10:00");
    const [counterLocation, setCounterLocation] = useState(() => {
        const loc = request.counterLocation || request.proposedLocation || request.property?.location?.generalArea || "";
        if (typeof loc === 'object' && loc !== null) {
            return loc.name || loc.location || loc.address || loc.generalArea || (typeof loc === 'string' ? loc : '');
        }
        if (typeof loc === 'string' && loc.startsWith('{')) {
            try {
                const parsed = JSON.parse(loc);
                return parsed.name || parsed.location || parsed.address || parsed.generalArea || loc;
            } catch (e) {
                return loc;
            }
        }
        return loc;
    });

    // Use counter values if they exist, otherwise use the first proposed date
    const displayDate = request.counterDate
        ? new Date(request.counterDate).toLocaleDateString()
        : (firstDate.date ? new Date(firstDate.date).toLocaleDateString() : "TBD");
    const displayTime = request.counterTime || firstDate.timeSlot || "TBD";

    // Robust location display with fallbacks
    const getDisplayLocation = () => {
        const rawLoc = request.counterLocation || request.proposedLocation || request.property?.location || "TBD";
        if (typeof rawLoc === 'string' && rawLoc.startsWith('{')) {
            try {
                const parsed = JSON.parse(rawLoc);
                const loc = parsed.name || parsed.location || parsed.address || parsed.generalArea || rawLoc;
                return typeof loc === 'string' ? loc : JSON.stringify(loc);
            } catch (e) {
                return rawLoc;
            }
        }
        if (typeof rawLoc === 'object' && rawLoc !== null) {
            const loc = rawLoc.name || rawLoc.location || rawLoc.address || rawLoc.generalArea;
            if (loc && typeof loc === 'string') return loc;
            if (loc && typeof loc === 'object') return JSON.stringify(loc);
            return JSON.stringify(rawLoc);
        }
        return rawLoc;
    };
    const displayLocation = getDisplayLocation();

    const booking = request.booking;
    const isMeetingInProgress = !!(booking?.physicalMeetingConfirmed || (booking?.hunterMetConfirmed && booking?.tenantMetConfirmed));
    const myId = userRole === "HUNTER" ? request.property?.hunterId : request.tenantId;
    const status = (request.status || "PENDING").toUpperCase();

    // Fetch package properties for Silver/Gold
    React.useEffect(() => {
        const fetchPackageProperties = async () => {
            if (userRole === "HUNTER" && request.property?.packageGroupId) {
                setFetchingPackage(true);
                try {
                    const response = await api.get(`/properties?packageGroupId=${request.property.packageGroupId}`);
                    // Ensure the primary property is in the list
                    const props = response.data.filter((p: any) => p.packageGroupId === request.property.packageGroupId);
                    setPackageProperties(props);
                    // Default select the primary property
                    setSelectedPropertyIds([request.propertyId]);
                } catch (error) {
                    console.error("Failed to fetch package properties:", error);
                } finally {
                    setFetchingPackage(false);
                }
            }
        };

        if (status === "ACCEPTED" || isMeetingInProgress) {
            fetchPackageProperties();
        }
    }, [request.property?.packageGroupId, userRole, status, isMeetingInProgress, request.propertyId]);

    const handleToggleProperty = (id: string) => {
        setSelectedPropertyIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const otherRoleLabel = userRole === "HUNTER" ? "TENANT" : "HUNTER";
    const partnerId = userRole === "HUNTER" ? request.tenantId : request.property?.agentId || request.property?.hunterId;

    const isMyTurn = !isMeetingInProgress && ((status === "PENDING" && userRole === "HUNTER") || (status === "COUNTERED" && request.counteredBy !== myId));
    const canEdit = !isMeetingInProgress && ((status === "PENDING" && userRole === "TENANT") || (status === "COUNTERED" && request.counteredBy === myId) || (status === "ACCEPTED"));
    const canCancel = (status === "PENDING" || status === "COUNTERED" || status === "ACCEPTED") && (!isMeetingInProgress || userRole === "HUNTER");
    const paymentStatus = (request.paymentStatus || "").toUpperCase();
    const canAccept = isMyTurn && status !== "ACCEPTED";
    const needsDeposit = paymentStatus !== "ESCROW" && paymentStatus !== "PAID";
    const canCounter = !isMeetingInProgress && (isMyTurn || canEdit || status === "ACCEPTED");
    const canDelete = status === "REJECTED" || status === "CANCELLED" || status === "COMPLETED";

    const [selectedProposedDate, setSelectedProposedDate] = useState<any>(null);

    React.useEffect(() => {
        if (proposedDates.length > 0 && !selectedProposedDate) {
            setSelectedProposedDate(proposedDates[0]);
        }
    }, [proposedDates, selectedProposedDate]);

    // Hunter Actions
    const handleAccept = async () => {
        setLoading(true);
        try {
            const payload: any = {};

            if (request.status === 'COUNTERED') {
                payload.scheduledDate = request.counterDate || firstDate.date;
                payload.scheduledTime = request.counterTime || firstDate.timeSlot;
                payload.location = request.counterLocation;
            } else {
                // Use selected proposed date if available, otherwise first one
                const dateToUse = selectedProposedDate || firstDate;
                payload.scheduledDate = dateToUse.date;
                payload.scheduledTime = dateToUse.timeSlot;

                // Use acceptLocation if specified, otherwise fallback to proposedLocation or property location
                const loc = acceptLocation || request.proposedLocation || request.property?.location?.generalArea;
                if (loc) {
                    payload.location = typeof loc === 'string' && loc.startsWith('{') ? loc : JSON.stringify({
                        type: "LANDMARK",
                        name: loc,
                        location: loc
                    });
                }
            }

            const response = await api.post(`/viewing-requests/${request.id}/accept`, payload);
            showToast("success", "Viewing request accepted! Booking created.");
            router.push("/haunter-dashboard/bookings" as Route);
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept request");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setConfirmModal({
            isOpen: true,
            title: "Reject Viewing Request",
            description: `Are you sure you want to reject this viewing request? ${userRole === "TENANT" ? "The booking will be cancelled and refund processed." : "The tenant will be refunded."}`,
            confirmText: "Yes, Reject",
            confirmButtonClass: "!bg-red-600 hover:!bg-red-700 text-white",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    if (request.bookingId) {
                        await api.post(`/bookings/${request.bookingId}/cancel`, {
                            reason: "Cancelled by hunter after meetup confirmed"
                        });
                    } else {
                        await api.post(`/viewing-requests/${request.id}/reject`, {
                            reason: "Not available at the proposed time"
                        });
                    }
                    showToast("success", request.bookingId ? "Booking cancelled successfully" : "Request rejected successfully");
                    onUpdate();
                } catch (error: any) {
                    showToast("error", error.response?.data?.message || `Failed to ${request.bookingId ? 'cancel booking' : 'reject request'}`);
                } finally {
                    setLoading(false);
                }
            }
        });
    };


    const handleCounter = async () => {
        if (!counterDate || !counterTime) {
            showToast("error", "Please select a date and time");
            return;
        }

        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/counter`, {
                date: new Date(counterDate).toISOString(),
                time: counterTime,
                location: JSON.stringify({
                    type: "LANDMARK",
                    name: counterLocation,
                    location: counterLocation
                }),
                message: `${canEdit ? 'Updated' : 'Counter-proposal'}: ${new Date(counterDate).toLocaleDateString()} at ${counterTime} at ${counterLocation}`
            });
            showToast("success", "Counter-proposal sent");
            setShowCounterForm(false);
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to send counter-proposal");
        } finally {
            setLoading(false);
        }
    };

    // Tenant Actions (for countered requests)
    const handleAcceptCounter = async () => {
        setLoading(true);
        try {
            // Send the counter values when accepting
            const payload = {
                scheduledDate: request.counterDate,
                scheduledTime: request.counterTime,
                location: request.counterLocation
            };

            await api.post(`/viewing-requests/${request.id}/accept`, payload);
            showToast("success", "Counter-proposal accepted! Booking confirmed.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to accept");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectCounter = async () => {
        setLoading(true);
        try {
            await api.post(`/viewing-requests/${request.id}/reject`, {
                reason: "Counter-proposal not acceptable"
            });
            showToast("success", "Request canceled. You will be refunded.");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to reject");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmModal({
            isOpen: true,
            title: "Delete from View",
            description: "Are you sure you want to remove this from your dashboard? This will NOT delete it for the other party.",
            confirmText: "Yes, Remove",
            confirmButtonClass: "!bg-red-600 hover:!bg-red-700 text-white",
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    // Always target the viewing request ID when deleting from this card
                    // My backend logic now ensures that hiding the request also hides the linked booking
                    const endpoint = `/viewing-requests/${request.id}`;
                    await api.delete(endpoint);
                    showToast("success", "Item removed from your view");
                    onUpdate();
                } catch (error: any) {
                    showToast("error", error.response?.data?.message || "Failed to remove item");
                    setLoading(false);
                }
            }
        });
    };

    const getStatusBadge = () => {
        const statusColors: Record<string, { bg: string, text: string, icon: string, label?: string }> = {
            PENDING: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: "la-clock" },
            ACCEPTED: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: "la-check-circle", label: "CONFIRMED" },
            COUNTERED: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", icon: "la-reply" },
            REJECTED: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", icon: "la-times-circle" },
            CANCELLED: { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400", icon: "la-ban", label: "CANCELED" },
            COMPLETED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: "la-flag-checkered" },
        };

        const config = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-600", icon: "la-info-circle" };
        const label = config.label || status;

        return (
            <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text} transition-all duration-300 shadow-sm border border-black/5 dark:border-white/5`}>
                    <i className={`las ${config.icon} text-sm`}></i>
                    {label}
                </span>
                {(status === "REJECTED" || status === "CANCELLED" || status === "COMPLETED") && (
                    <button
                        onClick={handleDelete}
                        className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 rounded-full"
                        title="Remove from view"
                    >
                        <i className="las la-trash-alt text-xl"></i>
                    </button>
                )}
            </div>
        );
    };

    const confirmArrived = async () => {
        setLoading(true);
        try {
            await api.post(`/bookings/${booking.id}/confirm-meeting`);
            showToast("success", "Presence confirmed!");
            onUpdate();
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Failed to confirm meeting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="group bg-white dark:bg-neutral-800/80 backdrop-blur-sm rounded-[2rem] border border-neutral-200 dark:border-neutral-700/50 p-5 sm:p-7 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 relative overflow-hidden">
            {/* Aesthetic accent gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>

            <div className="flex flex-col lg:flex-row gap-6 relative z-10">
                {/* Property Image */}
                <Link
                    href={`/listing-stay-detail/${request.propertyId || request.property?.id}` as Route}
                    className="lg:w-48 h-32 relative rounded-xl overflow-hidden flex-shrink-0 cursor-pointer block"
                >
                    <Image
                        fill
                        src={(() => {
                            const images = request.property?.images;
                            if (Array.isArray(images) && images.length > 0) return images[0];
                            if (typeof images === 'string') {
                                try {
                                    const parsed = JSON.parse(images);
                                    return Array.isArray(parsed) ? parsed[0] : parsed;
                                } catch (e) {
                                    return images;
                                }
                            }
                            return "/placeholder.jpg";
                        })()}
                        alt={request.property?.title || "Property"}
                        className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                </Link>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <Link href={`/listing-stay-detail/${request.propertyId || request.property?.id}` as Route}>
                                <h3 className="text-lg font-semibold hover:text-primary-600 transition-colors cursor-pointer">
                                    {request.property?.title || "Property"}
                                </h3>
                            </Link>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {(() => {
                                    const loc = request.property?.location;
                                    if (typeof loc === 'string') {
                                        try {
                                            const parsed = JSON.parse(loc);
                                            return parsed.generalArea || parsed.name || loc;
                                        } catch (e) {
                                            return loc;
                                        }
                                    }
                                    return loc?.generalArea || loc?.name || "Location";
                                })()}
                            </p>
                        </div>
                        {getStatusBadge()}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-8">
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-user text-xs"></i>
                                {userRole === "HUNTER" ? "Tenant" : "House Hunter"}
                            </p>
                            <p className="font-semibold text-sm sm:text-base truncate">
                                {userRole === "HUNTER" ? request.tenant?.name : request.property?.hunter?.name}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-calendar text-xs"></i>
                                Scheduled
                            </p>
                            <p className="font-semibold text-sm sm:text-base">
                                {displayDate} <span className="text-neutral-400 font-normal">at</span> {displayTime}
                            </p>
                        </div>
                        {/* Package Info Slot */}
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-box text-xs"></i>
                                Viewing Tier
                            </p>
                            <div className="flex items-center gap-2">
                                <p className={`font-bold text-sm sm:text-base uppercase tracking-tight ${request.package?.tier === "GOLD" ? "text-yellow-600 dark:text-yellow-400" :
                                    request.package?.tier === "SILVER" ? "text-neutral-500 underline decoration-neutral-300" :
                                        "text-orange-600 dark:text-orange-500"
                                    }`}>
                                    {request.package?.tier || (request.amount > 3000 ? "GOLD" : request.amount > 1500 ? "SILVER" : "BRONZE")}
                                </p>
                                {(request.package?.tier !== "BRONZE" || (!request.package && request.amount > 1500)) && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                        {request.package?.propertiesIncluded || (request.amount > 3000 ? 5 : 2)} HOUSES
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2 md:col-span-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-map-marker text-xs"></i>
                                Meeting Point
                            </p>
                            <p className="font-semibold text-sm sm:text-base truncate" title={displayLocation}>
                                {displayLocation}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-wallet text-xs"></i>
                                Service Fee
                            </p>
                            <p className="font-bold text-sm sm:text-base text-primary-600 dark:text-primary-400">
                                KES {request.amount?.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                                <i className="las la-shield-alt text-xs"></i>
                                Payment
                            </p>
                            <p className="font-semibold text-xs sm:text-sm inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-990/20 px-2 py-0.5 rounded-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {paymentStatus === "ESCROW" ? "In Escrow" : paymentStatus}
                            </p>
                        </div>
                    </div>

                    {/* Bundle Members Display - Only for explicit Gold/Silver packages */}
                    {(request.package?.tier === "GOLD" || request.package?.tier === "SILVER") &&
                        request.property?.packageMembers?.length > 0 && (
                            <div className="mb-8 p-5 bg-neutral-50 dark:bg-neutral-900/40 rounded-3xl border border-neutral-100 dark:border-neutral-800/60 shadow-inner">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                            <i className="las la-layer-group text-lg"></i>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">Bundle Viewing Schedule</h4>
                                            <p className="text-[10px] text-neutral-500 font-medium">This request covers all houses in this package</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-900/20 text-[10px] font-bold text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/50">
                                        {request.property.packageMembers.length + 1} TOTAL PROPERTIES
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {/* The main property first */}
                                    <div className="relative aspect-square rounded-xl overflow-hidden ring-2 ring-primary-500/20 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900">
                                        <Image
                                            fill
                                            src={(() => {
                                                const images = request.property?.images;
                                                if (Array.isArray(images) && images.length > 0) return images[0];
                                                return "/placeholder.jpg";
                                            })()}
                                            alt="Main"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                                            <span className="px-1.5 py-0.5 bg-primary-600 text-white text-[8px] font-bold rounded uppercase tracking-tighter">Current</span>
                                        </div>
                                    </div>

                                    {request.property.packageMembers.map((member: any) => (
                                        <Link
                                            key={member.id}
                                            href={`/listing-stay-detail/${member.id}` as Route}
                                            className="group/house relative aspect-square rounded-xl overflow-hidden hover:ring-2 hover:ring-primary-500/30 transition-all"
                                        >
                                            <Image
                                                fill
                                                src={Array.isArray(member.images) ? member.images[0] : (typeof member.images === 'string' ? JSON.parse(member.images)[0] : "/placeholder.jpg")}
                                                alt={member.title}
                                                className="object-cover group-hover/house:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2 opacity-0 group-hover/house:opacity-100 transition-opacity">
                                                <span className="text-[8px] text-white font-bold truncate leading-none">{member.title}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Actions */}
                    {(status === "PENDING" || status === "COUNTERED" || status === "ACCEPTED" || canDelete) && (
                        <div className="border-t border-neutral-100 dark:border-neutral-700/50 pt-6">
                            {!showCounterForm ? (
                                <div className="flex flex-wrap gap-3 w-full">
                                    {canAccept && !showAcceptForm && (
                                        <button
                                            onClick={() => {
                                                if (needsDeposit) {
                                                    showToast("info", "Please wait for the tenant to complete the deposit before accepting.");
                                                    return;
                                                }
                                                if (userRole === "HUNTER" && status === "PENDING") {
                                                    setShowAcceptForm(true);
                                                } else {
                                                    handleAccept();
                                                }
                                            }}
                                            disabled={loading}
                                            className={`flex-1 sm:flex-none px-8 py-3.5 text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 group/btn active:scale-95 disabled:opacity-50 ${needsDeposit
                                                ? "bg-neutral-400 cursor-not-allowed"
                                                : "bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-lg hover:shadow-primary-500/30"
                                                }`}
                                        >
                                            <i className="las la-check-circle text-lg group-hover/btn:scale-110 transition-transform"></i>
                                            {needsDeposit ? "Waiting for Tenant Deposit" : "Accept Proposal"}
                                        </button>
                                    )}
                                    {canEdit && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-8 py-3.5 bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
                                        >
                                            <i className="las la-edit text-lg"></i>
                                            Edit Proposal
                                        </button>
                                    )}
                                    {!canEdit && canCounter && (
                                        <button
                                            onClick={() => setShowCounterForm(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-8 py-3.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-2xl hover:bg-neutral-800 dark:hover:bg-white transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            <i className="las la-history text-lg"></i>
                                            Edit Proposal
                                        </button>
                                    )}
                                    {canCancel && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-8 py-3.5 border-2 border-rose-100 text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            <i className="las la-times-circle text-lg"></i>
                                            {isMeetingInProgress ? "Cancel Viewing" : "Cancel Request"}
                                        </button>
                                    )}

                                    {/* Messaging button - Unified for Hunter and Tenant */}
                                    {partnerId && (
                                        <Link
                                            href={(userRole === "HUNTER"
                                                ? `/haunter-dashboard/messages?partnerId=${partnerId}&propertyId=${request.propertyId}&propertyTitle=${encodeURIComponent(request.property?.title || "")}`
                                                : `/tenant-dashboard/messages?partnerId=${partnerId}&propertyId=${request.propertyId}&propertyTitle=${encodeURIComponent(request.property?.title || "")}`) as Route}
                                            className="flex-1 sm:flex-none px-8 py-3.5 border-2 border-primary-100 text-primary-600 hover:border-primary-200 hover:bg-primary-50 dark:border-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <i className="las la-comment-dots text-lg"></i>
                                            {userRole === "HUNTER" ? "Message Tenant" : "Message Hunter"}
                                        </Link>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="flex-1 sm:flex-none px-8 py-3.5 border-2 border-neutral-100 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            <i className="las la-trash-alt text-lg"></i>
                                            Delete Request
                                        </button>
                                    )}
                                </div>
                            ) : showAcceptForm ? (
                                <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900/40 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <i className="las la-map-marker text-primary-600"></i>
                                        <p className="text-sm font-bold uppercase tracking-tight">Set Meeting Point</p>
                                    </div>
                                    <input
                                        type="text"
                                        value={acceptLocation}
                                        onChange={(e) => setAcceptLocation(e.target.value)}
                                        placeholder="e.g., Meet at Junction Mall Entrance"
                                        className="w-full rounded-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-500 focus:ring-primary-500 text-sm py-3"
                                    />

                                    {userRole === "HUNTER" && proposedDates.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Select one of the proposed dates</p>
                                            <div className="flex flex-wrap gap-2">
                                                {proposedDates.map((dateObj: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setSelectedProposedDate(dateObj)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedProposedDate === dateObj
                                                            ? "bg-primary-600 text-white shadow-md scale-105"
                                                            : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-primary-300"
                                                            }`}
                                                    >
                                                        {new Date(dateObj.date).toLocaleDateString()} at {dateObj.timeSlot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAccept}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold text-sm shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            Confirm & Accept
                                        </button>
                                        <button
                                            onClick={() => setShowAcceptForm(false)}
                                            className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 mt-4">
                                    <div className="flex items-center gap-2">
                                        <i className="las la-history text-indigo-600"></i>
                                        <p className="text-sm font-bold uppercase tracking-tight">
                                            {canEdit ? "Update Your Proposal" : "Propose Alternative"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Preferred Date</label>
                                            <input
                                                type="date"
                                                value={counterDate}
                                                onChange={(e) => setCounterDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full rounded-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-500 focus:ring-primary-500 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Preferred Time</label>
                                            <select
                                                value={counterTime}
                                                onChange={(e) => setCounterTime(e.target.value)}
                                                className="w-full rounded-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-500 focus:ring-primary-500 text-sm"
                                            >
                                                {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                                    <option key={time} value={time}>{time}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Specific Meeting Location</label>
                                        <input
                                            type="text"
                                            value={counterLocation}
                                            onChange={(e) => setCounterLocation(e.target.value)}
                                            placeholder="e.g., Outside TRM Main Entrance"
                                            className="w-full rounded-xl border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-500 focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCounter}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            {canEdit ? "Update Request" : "Send Counter-Proposal"}
                                        </button>
                                        <button
                                            onClick={() => setShowCounterForm(false)}
                                            className="px-6 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isMyTurn && status === "COUNTERED" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                ⏳ Waiting for the other party to respond to the counter-proposal...
                            </p>
                        </div>
                    )}

                    {/* Status messages */}
                    {userRole === "TENANT" && request.status === "PENDING" && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                            <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                ⏳ Waiting for House Hunter to confirm your viewing request. You can still edit your proposal below if needed.
                            </p>
                        </div>
                    )}

                    {status === "ACCEPTED" && (
                        <div className="bg-emerald-50 dark:bg-emerald-990/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <i className="las la-calendar-check text-xl"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-tight">Viewing Confirmed</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                        {isMeetingInProgress ? (
                                            "Your viewing session is currently active."
                                        ) : isToday ? (
                                            "Get ready! The viewing is scheduled for today."
                                        ) : `Scheduled for ${displayDate} at ${displayTime}`}
                                    </p>
                                </div>
                            </div>

                            {(isToday || isMeetingInProgress) && (
                                <div className="space-y-4 pt-4 border-t border-emerald-100 dark:border-emerald-800/40">
                                    {(() => {
                                        const booking = request.booking;
                                        if (!booking) return null;

                                        const hasCurrentConfirmed = userRole === "HUNTER" ? booking.hunterMetConfirmed : booking.tenantMetConfirmed;
                                        const hasOtherConfirmed = userRole === "HUNTER" ? booking.tenantMetConfirmed : booking.hunterMetConfirmed;
                                        const otherRoleLabel = userRole === "HUNTER" ? "TENANT" : "HUNTER";

                                        if (hasCurrentConfirmed && hasOtherConfirmed) {
                                            const isIssueReporter = booking.issueReporterId === myId;
                                            const hasPendingIssue = booking.issueCreated && booking.issueStatus === 'PENDING';

                                            return (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm bg-emerald-100/50 dark:bg-emerald-900/30 p-3 rounded-xl">
                                                        <i className="las la-handshake text-lg text-emerald-500"></i>
                                                        SESSION ACTIVE
                                                    </div>

                                                    {hasPendingIssue ? (
                                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                                                    <i className="las la-exclamation-triangle text-lg"></i>
                                                                </div>
                                                                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 uppercase tracking-tight">
                                                                    {isIssueReporter ? "You reported an issue" : `${otherRoleLabel} reported an issue`}
                                                                </h4>
                                                            </div>
                                                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-5 italic line-clamp-2">
                                                                &quot;{booking.tenantFeedback}&quot;
                                                            </p>

                                                            <div className="flex flex-col sm:flex-row gap-3">
                                                                {userRole === "HUNTER" ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                isOpen: true,
                                                                                title: "Accept Issue",
                                                                                description: "Are you sure you want to ACCEPT this issue? This will cancel the viewing and refund the tenant.",
                                                                                confirmText: "Accept Issue",
                                                                                confirmButtonClass: "!bg-emerald-600 hover:!bg-emerald-700 text-white",
                                                                                onConfirm: async () => {
                                                                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                    setLoading(true);
                                                                                    try {
                                                                                        await api.post(`/bookings/${booking.id}/respond-issue`, { action: 'ACCEPT' });
                                                                                        showToast("success", "Issue accepted. Viewing cancelled.");
                                                                                        onUpdate();
                                                                                    } catch (error: any) {
                                                                                        showToast("error", error.response?.data?.message || "Failed to accept issue");
                                                                                    } finally {
                                                                                        setLoading(false);
                                                                                    }
                                                                                }
                                                                            })}
                                                                            disabled={loading}
                                                                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                                                        >
                                                                            <i className="las la-check"></i>
                                                                            ACCEPT ISSUE
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                isOpen: true,
                                                                                title: "Deny Issue",
                                                                                description: "Are you sure you want to DENY this issue? This will open an admin dispute.",
                                                                                confirmText: "Deny Issue",
                                                                                confirmButtonClass: "!bg-rose-600 hover:!bg-rose-700 text-white",
                                                                                onConfirm: async () => {
                                                                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                    setLoading(true);
                                                                                    try {
                                                                                        await api.post(`/bookings/${booking.id}/respond-issue`, { action: 'DENY' });
                                                                                        showToast("warning", "Issue denied. Dispute opened for admin.");
                                                                                        onUpdate();
                                                                                    } catch (error: any) {
                                                                                        showToast("error", error.response?.data?.message || "Failed to deny issue");
                                                                                    } finally {
                                                                                        setLoading(false);
                                                                                    }
                                                                                }
                                                                            })}
                                                                            disabled={loading}
                                                                            className="flex-1 px-4 py-2.5 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all font-bold text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                                                        >
                                                                            <i className="las la-times"></i>
                                                                            DENY ISSUE
                                                                        </button>
                                                                    </>
                                                                ) : isIssueReporter && (
                                                                    <button
                                                                        onClick={() => setConfirmModal({
                                                                            isOpen: true,
                                                                            title: "Withdraw Issue",
                                                                            description: "Are you sure you want to withdraw this issue?",
                                                                            confirmText: "Withdraw",
                                                                            confirmButtonClass: "!bg-neutral-600 hover:!bg-neutral-700 text-white",
                                                                            onConfirm: async () => {
                                                                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                                setLoading(true);
                                                                                try {
                                                                                    await api.post(`/bookings/${booking.id}/cancel-issue`);
                                                                                    showToast("success", "Issue withdrawn.");
                                                                                    onUpdate();
                                                                                } catch (error: any) {
                                                                                    showToast("error", error.response?.data?.message || "Failed to withdraw issue");
                                                                                } finally {
                                                                                    setLoading(false);
                                                                                }
                                                                            }
                                                                        })}
                                                                        disabled={loading}
                                                                        className="w-full px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all font-bold text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                                                    >
                                                                        <i className="las la-undo text-base"></i>
                                                                        WITHDRAW ISSUE
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : booking.issueStatus === 'DENIED' ? (
                                                        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex justify-center items-center gap-3 shadow-inner">
                                                            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                                                <i className="las la-gavel text-lg animate-pulse"></i>
                                                            </div>
                                                            <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-tight">
                                                                Issue Disputed - Waiting for Admin Resolution
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                            {!(userRole === "HUNTER" ? booking.hunterDone : booking.tenantDone) ? (
                                                                <button
                                                                    onClick={() => setConfirmModal({
                                                                        isOpen: true,
                                                                        title: "Complete Viewing",
                                                                        description: userRole === "HUNTER" && packageProperties.length > 1
                                                                            ? "Which property (or properties) did the tenant end up picking? Selecting a property will mark it as RENTED."
                                                                            : "Are you satisfied with the viewing? This will release payment once both parties confirm.",
                                                                        children: userRole === "HUNTER" && packageProperties.length > 1 ? (
                                                                            <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                                                                                {packageProperties.map((prop) => (
                                                                                    <label key={prop.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedPropertyIds.includes(prop.id)}
                                                                                            onChange={() => handleToggleProperty(prop.id)}
                                                                                            className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-neutral-300"
                                                                                        />
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="font-medium text-sm truncate">{prop.title}</p>
                                                                                            <p className="text-xs text-neutral-500 truncate">{prop.location?.address || prop.location?.generalArea}</p>
                                                                                        </div>
                                                                                        <span className="text-sm font-bold text-primary-600">KES {prop.rent.toLocaleString()}</span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        ) : null,
                                                                        confirmText: "Mark as Done",
                                                                        confirmButtonClass: "!bg-primary-600 hover:!bg-primary-700 text-white",
                                                                        onConfirm: async () => {
                                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                                            setLoading(true);
                                                                            try {
                                                                                await api.post(`/bookings/${booking.id}/done`, {
                                                                                    pickedPropertyIds: userRole === "HUNTER" ? selectedPropertyIds : undefined
                                                                                });
                                                                                showToast("success", "Marked as completed!");
                                                                                if (userRole === "TENANT") {
                                                                                    setShowReviewModal(true);
                                                                                    // onUpdate will be called after review or if they close the modal
                                                                                } else {
                                                                                    onUpdate();
                                                                                }
                                                                            } catch (error: any) {
                                                                                showToast("error", error.response?.data?.message || "Failed to mark done");
                                                                            } finally {
                                                                                setLoading(false);
                                                                            }
                                                                        }
                                                                    })}
                                                                    disabled={loading}
                                                                    className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    <i className="las la-check-double text-lg"></i>
                                                                    MARK AS SATISFIED (DONE)
                                                                </button>
                                                            ) : (
                                                                <div className="flex-1 bg-neutral-100 dark:bg-neutral-800/40 p-4 rounded-xl flex items-center justify-center gap-2 text-neutral-500 dark:text-neutral-400 font-bold text-[10px] uppercase tracking-widest border border-neutral-200 dark:border-neutral-700/50">
                                                                    <i className="las la-hourglass-half text-lg animate-pulse text-primary-500"></i>
                                                                    Waiting for {otherRoleLabel} to finish
                                                                </div>
                                                            )}

                                                            {!booking.issueCreated && userRole === "TENANT" && (
                                                                <button
                                                                    onClick={() => setShowReportIssueModal(true)}
                                                                    disabled={loading}
                                                                    className="px-8 py-4 border-2 border-rose-100 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-2xl transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
                                                                >
                                                                    REPORT ISSUE
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (hasCurrentConfirmed && !hasOtherConfirmed) {
                                            return (
                                                <div className="flex flex-col gap-3 p-4 bg-emerald-100/30 dark:bg-emerald-990/5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 shadow-inner">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-tight">
                                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                                            I AM READY
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600/60 uppercase animate-pulse">
                                                            WAITING FOR {otherRoleLabel}...
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-emerald-500 h-full w-1/2 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                                                    <i className="las la-info-circle text-base"></i>
                                                    {userRole === "HUNTER"
                                                        ? "Arrived? Let the tenant know you're ready."
                                                        : `Confirm you've met the ${otherRoleLabel.toLowerCase()}.`}
                                                </p>
                                                <button
                                                    onClick={confirmArrived}
                                                    disabled={loading}
                                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <i className="las la-map-marker-alt text-lg"></i>
                                                    {userRole === "HUNTER" ? "I'M AT THE MEETING POINT" : `I'VE MET THE ${otherRoleLabel}`}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {(status === "REJECTED" || status === "CANCELLED" || status === "COMPLETED") && (
                        <div className="space-y-4">
                            <div className={`${status === "COMPLETED" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-neutral-50 dark:bg-neutral-900/40"} p-6 rounded-[1.5rem] border border-neutral-100 dark:border-neutral-800/50 flex items-center gap-4`}>
                                <div className={`w-12 h-12 rounded-full ${status === "COMPLETED" ? "bg-blue-100 dark:bg-blue-800/40 text-blue-600" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"} flex items-center justify-center`}>
                                    <i className={`las ${status === "COMPLETED" ? "la-flag-checkered" : "la-times-circle"} text-2xl`}></i>
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${status === "COMPLETED" ? "text-blue-900 dark:text-blue-100" : "text-neutral-700 dark:text-neutral-300"} uppercase tracking-tight`}>
                                        {status === "COMPLETED" ? "Successful Completion" : `Request ${status === "CANCELLED" ? "Canceled" : "Rejected"}`}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        {status === "COMPLETED" ? "The viewing was finalized successfully." : (
                                            <>
                                                This transaction will not proceed.
                                                {userRole === "TENANT" ? " Any held funds will be released back to your wallet." : " Use the search tool to find more tenants."}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {status === "COMPLETED" && userRole === "TENANT" && (
                                (() => {
                                    const hasReviewed = booking?.reviews?.some((r: any) => r.type === 'TENANT_TO_HUNTER');
                                    if (hasReviewed) return (
                                        <div className="flex items-center gap-2 justify-center py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            <i className="las la-check-circle text-emerald-500"></i>
                                            Feedback Submitted
                                        </div>
                                    );

                                    return (
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="w-full px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl hover:shadow-xl hover:shadow-primary-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <i className="las la-star text-lg"></i>
                                            RATE YOUR EXPERIENCE
                                        </button>
                                    );
                                })()
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals with premium styling */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                    if (status === "COMPLETED" || booking?.status === "COMPLETED") {
                        onUpdate();
                    }
                }}
                hunterName={request.property?.hunter?.name}
                onConfirm={async (rating, comment) => {
                    setLoading(true);
                    try {
                        await api.post("/reviews", {
                            bookingId: booking.id,
                            rating,
                            comment
                        });
                        showToast("success", "Feedback sent! We appreciate you.");
                        setShowReviewModal(false);
                        router.push("/tenant-dashboard/bookings" as Route);
                        onUpdate();
                    } catch (error: any) {
                        showToast("error", error.response?.data?.message || "Failed to submit review");
                    } finally {
                        setLoading(false);
                    }
                }}
                loading={loading}
            />

            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                    setShowCancelModal(false);
                    userRole === "TENANT" ? handleRejectCounter() : handleReject();
                }}
                title={isMeetingInProgress ? "Cancel Session?" : "Cancel Request?"}
                description={isMeetingInProgress
                    ? "Canceling an active session will trigger a full refund for the tenant. Proceed only if the meeting failed to happen."
                    : `Are you sure? ${userRole === "TENANT" ? "Your funds will be unlocked." : "The tenant's deposit will be returned."}`}
                confirmText={isMeetingInProgress ? "Yes, Cancel Session" : "Yes, Cancel Request"}
                confirmButtonClass="!bg-rose-600 hover:!bg-rose-700 text-white"
                loading={loading}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                children={confirmModal.children}
                confirmText={confirmModal.confirmText}
                confirmButtonClass={confirmModal.confirmButtonClass}
                loading={loading}
            />

            <IssueReportModal
                isOpen={showReportIssueModal}
                onClose={() => setShowReportIssueModal(false)}
                onConfirm={async (feedback) => {
                    setShowReportIssueModal(false);
                    setLoading(true);
                    try {
                        await api.post(`/bookings/${booking.id}/outcome`, {
                            outcome: "ISSUE_REPORTED",
                            feedback
                        });
                        showToast("warning", "Dispute filed. Waiting for hunter response.");
                        router.push("/tenant-dashboard/bookings" as Route);
                        onUpdate();
                    } catch (error: any) {
                        showToast("error", error.response?.data?.message || "Failed to report issue");
                    } finally {
                        setLoading(false);
                    }
                }}
                loading={loading}
            />
        </div>
    );
};
