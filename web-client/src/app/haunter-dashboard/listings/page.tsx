"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProperties } from "@/contexts/PropertyContext";
import { useToast } from "@/components/Toast";
import Image from "next/image";
import Link from "next/link";
import { Route } from "@/routers/types";
import Skeleton from "@/shared/Skeleton";
import api from "@/services/api";
import { useEffect } from "react";
import GoldPackageManagementCard from "@/components/GoldPackageManagementCard";
import UpgradePropertyModal from "@/components/UpgradePropertyModal";
import { PropertyListing } from "@/data/types";

type ListEntity =
    | { isBundle: true; id: string; tier: string; members: PropertyListing[]; searchString: string; area: string }
    | { isBundle: false; id: string | number; tier: string; property: PropertyListing; searchString: string; area: string };

export default function ListingsPage() {
    const { user } = useAuth();
    const { properties: allProperties, deleteProperty, refreshProperties } = useProperties();
    const { showToast } = useToast();

    // UI State
    const [activeTab, setActiveTab] = useState<"ALL" | "GOLD" | "SILVER" | "BRONZE" | "RENTED">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [areaFilter, setAreaFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Compact view allows more, but keep it snappy

    const [propertyToDelete, setPropertyToDelete] = useState<string | number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [propertyToUpgrade, setPropertyToUpgrade] = useState<any | null>(null);
    const [packageGroups, setPackageGroups] = useState<Record<string, { tier: string, members: PropertyListing[] }>>({});
    const [loadingPackages, setLoadingPackages] = useState(true);

    useEffect(() => {
        refreshProperties();
    }, [refreshProperties]);

    const haunterProperties = allProperties.filter((p) => p.agent.id === user?.id);

    // Extract unique areas for filtering
    const areas = Array.from(new Set(haunterProperties.map(p => p.location.generalArea))).sort();

    // Group properties by package
    useEffect(() => {
        const groupProperties = async () => {
            setLoadingPackages(true);
            const groups: Record<string, { tier: string, members: PropertyListing[] }> = {};
            const processedIds = new Set<string | number>();

            haunterProperties.forEach(prop => {
                if (prop.packageGroupId && !processedIds.has(prop.id)) {
                    if (!groups[prop.packageGroupId]) {
                        const tier = prop.listingPackage || prop.viewingPackages?.find((pkg: { tier: string }) => pkg.tier !== 'BRONZE')?.tier?.toUpperCase() || 'GOLD';
                        groups[prop.packageGroupId] = {
                            tier,
                            members: []
                        };
                    }
                    groups[prop.packageGroupId].members.push(prop);
                    processedIds.add(prop.id);
                }
            });

            setPackageGroups(groups);
            setLoadingPackages(false);
        };

        if (haunterProperties.length > 0) {
            groupProperties();
        } else {
            setLoadingPackages(false);
        }
    }, [haunterProperties.length]);

    // Filtering logic
    const getFilteredContent = (): ListEntity[] => {
        // 1. Get all logical "entities" (Standalone properties + Bundle groups)
        const standaloneProps = haunterProperties.filter(p => !p.packageGroupId);
        const bundles: ListEntity[] = Object.entries(packageGroups).map(([id, data]) => ({
            id,
            isBundle: true,
            tier: data.tier,
            members: data.members,
            // For search, we combine titles of members
            searchString: `${data.tier} Bundle ${id} ${data.members.map(m => m.title).join(' ')} ${data.members[0]?.location.generalArea}`.toLowerCase(),
            area: data.members[0]?.location.generalArea
        }));

        const standaloneEntities: ListEntity[] = standaloneProps.map(p => ({
            id: p.id,
            isBundle: false,
            tier: p.listingPackage || 'BRONZE',
            property: p,
            searchString: `${p.title} ${p.location.directions} ${p.location.generalArea}`.toLowerCase(),
            area: p.location.generalArea
        }));

        const allEntities = [...bundles, ...standaloneEntities];

        // 2. Apply Filters
        return allEntities.filter(entity => {
            let matchesTab = activeTab === "ALL" || entity.tier === activeTab;

            // Special handling for RENTED tab
            if (activeTab === "RENTED") {
                if (entity.isBundle) {
                    matchesTab = entity.members.every(m => m.status === 'rented');
                } else {
                    matchesTab = entity.property.status === 'rented';
                }
            } else if (activeTab === "ALL") {
                // In "ALL", show everything
                matchesTab = true;
            } else {
                // For Tier tabs (GOLD/SILVER/BRONZE), don't show rented by default unless it's the RENTED tab
                const isRented = entity.isBundle ? entity.members.every(m => m.status === 'rented') : entity.property.status === 'rented';
                matchesTab = (entity.tier === activeTab) && !isRented;
            }

            const matchesSearch = entity.searchString.includes(searchQuery.toLowerCase());
            const matchesArea = areaFilter === "all" || entity.area === areaFilter;
            return matchesTab && matchesSearch && matchesArea;
        });
    };

    const filteredEntities = getFilteredContent();
    const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
    const paginatedEntities = filteredEntities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDeleteProperty = async () => {
        if (!propertyToDelete) return;
        setIsDeleting(true);
        try {
            await deleteProperty(propertyToDelete);
            showToast("success", "Property deleted successfully");
            setPropertyToDelete(null);
        } catch (error) {
            showToast("error", "Failed to delete property");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manage Listings</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        {haunterProperties.length} properties across your portfolio
                    </p>
                </div>
                <Link
                    href="/add-listing/1"
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
                >
                    <i className="las la-plus text-lg"></i>
                    Add New Listing
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <i className="las la-search absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xl"></i>
                    <input
                        type="text"
                        placeholder="Search by title, address, or bundle ID..."
                        className="w-full pl-12 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="md:w-64 relative">
                    <i className="las la-map-marker absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-xl"></i>
                    <select
                        className="w-full pl-12 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                        value={areaFilter}
                        onChange={(e) => { setAreaFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="all">All Neighborhoods</option>
                        {areas.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <i className="las la-angle-down absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"></i>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl w-fit overflow-x-auto">
                {["ALL", "GOLD", "SILVER", "BRONZE", "RENTED"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                            ? "bg-white dark:bg-neutral-800 text-primary-600 shadow-sm"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            }`}
                    >
                        {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {haunterProperties.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-3xl p-16 border border-dashed border-neutral-300 dark:border-neutral-700 text-center">
                    <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="las la-home text-4xl text-neutral-300"></i>
                    </div>
                    <h3 className="text-xl font-bold">No active listings</h3>
                    <p className="text-neutral-500 mt-2 mb-8">Start growing your portfolio by adding your first property.</p>
                    <Link href="/add-listing/1" className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:shadow-xl transition-all">
                        Create First Listing
                    </Link>
                </div>
            ) : filteredEntities.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-neutral-500 text-lg">No properties match your current filters.</p>
                    <button
                        onClick={() => { setSearchQuery(""); setAreaFilter("all"); setActiveTab("ALL"); }}
                        className="mt-4 text-primary-600 font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedEntities.map((entity) => (
                            <div key={entity.id} className="transition-transform duration-200">
                                {entity.isBundle ? (
                                    <GoldPackageManagementCard
                                        packageGroupId={entity.id}
                                        packageMembers={entity.members}
                                        onPackageUpdate={() => refreshProperties()}
                                        isCompact // Pass a flag for the new redesign
                                    />
                                ) : (
                                    <div className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 hover:shadow-xl transition-all group border-b-4 border-b-primary-200 dark:border-b-primary-900/30">
                                        <div className="h-40 relative group">
                                            <Image
                                                fill
                                                src={entity.property.images[0] || "/placeholder.jpg"}
                                                alt={entity.property.title}
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 shadow-sm border border-neutral-200 dark:border-neutral-700">
                                                    Bronze
                                                </span>
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${entity.property.status === 'available' ? 'bg-green-500 text-white' : 'bg-neutral-600 text-white'
                                                    }`}>
                                                    {entity.property.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1 text-base">{entity.property.title}</h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-neutral-500 dark:text-neutral-400 text-xs">
                                                <i className="las la-map-marker text-primary-500"></i>
                                                <span className="truncate">{entity.area}</span>
                                            </div>

                                            <div className="flex items-baseline gap-1 mt-3">
                                                <span className="text-xl font-black text-primary-600">KES {entity.property.rent?.toLocaleString()}</span>
                                                <span className="text-[10px] text-neutral-500 font-bold">/ MONTH</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                <Link
                                                    href={`/edit-listing/${entity.property.id}`}
                                                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold text-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => setPropertyToUpgrade(entity.property)}
                                                    className="px-3 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold text-center hover:bg-primary-700 transition-colors shadow-sm"
                                                >
                                                    Upgrade
                                                </button>
                                                <Link
                                                    href={`/listing-stay-detail/${entity.property.id}`}
                                                    className="col-span-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-center hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => setPropertyToDelete(entity.property.id)}
                                                    className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-xs font-bold transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-8">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center"
                            >
                                <i className="las la-angle-left"></i>
                            </button>
                            <span className="text-sm font-bold text-neutral-500">
                                Page <span className="text-neutral-900 dark:text-white">{currentPage}</span> of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center"
                            >
                                <i className="las la-angle-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals from previous version kept for functionality */}
            {propertyToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <i className="las la-exclamation-triangle text-3xl text-red-600"></i>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Delete property?</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                            This listing and its associated packages will be permanently removed. This action cannot be reversed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPropertyToDelete(null)}
                                className="flex-1 px-6 py-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProperty}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {propertyToUpgrade && (
                <UpgradePropertyModal
                    property={propertyToUpgrade}
                    onClose={() => setPropertyToUpgrade(null)}
                    onUpgrade={() => refreshProperties()}
                />
            )}
        </div>
    );
}
