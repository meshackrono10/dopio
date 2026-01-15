"use client";

import React from "react";
import { AnalyticsData, MOCK_ANALYTICS } from "@/data/mockDocuments";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface HaunterAnalyticsProps {
    data?: AnalyticsData;
    className?: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const HaunterAnalytics: React.FC<HaunterAnalyticsProps> = ({
    data = MOCK_ANALYTICS,
    className = "",
}) => {
    return (
        <div className={`haunter-analytics ${className}`}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <i className="las la-calendar-check text-4xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-3xl font-bold">{data.bookings.total}</p>
                    <p className="text-sm opacity-90 mt-1">Total Bookings</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <i className="las la-wallet text-4xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Month</span>
                    </div>
                    <p className="text-3xl font-bold">KES {(data.revenue.thisMonth / 1000).toFixed(0)}K</p>
                    <p className="text-sm opacity-90 mt-1">Revenue</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <i className="las la-star text-4xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Average</span>
                    </div>
                    <p className="text-3xl font-bold">{data.ratings.average}</p>
                    <p className="text-sm opacity-90 mt-1">Rating ({data.ratings.total} reviews)</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <i className="las la-home text-4xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <p className="text-3xl font-bold">{data.properties.total}</p>
                    <p className="text-sm opacity-90 mt-1">Properties Shown</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bookings Trend */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.bookings.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'

                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Bookings" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Package */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Package</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data.revenue.byPackage}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}K`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.revenue.byPackage.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.revenue.trend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="amount" fill="#10b981" name="Revenue (KES)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {data.ratings.distribution.map((item) => {
                            const percentage = (item.count / data.ratings.total) * 100;
                            return (
                                <div key={item.rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 min-w-[60px]">
                                        <span className="text-sm font-medium">{item.rating}</span>
                                        <i className="las la-star text-yellow-500 text-sm"></i>
                                    </div>
                                    <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="bg-yellow-500 h-full rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-right">
                                        {item.count} ({percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Most Viewed Properties */}
            <div className="mt-6 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Properties</h3>
                <div className="space-y-3">
                    {data.properties.mostViewed.map((property, index) => (
                        <div key={property.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-neutral-400' : 'bg-orange-600'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className="font-medium">{property.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <i className="las la-eye"></i>
                                <span>{property.views} views</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HaunterAnalytics;
