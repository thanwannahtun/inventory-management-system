'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { authFetch } from '@/lib/api-client';
import {
    Search, Filter, ChevronLeft, ChevronRight, List,
    TrendingUp, TrendingDown, Package, Folder, Clock
} from 'lucide-react';

export default function ActivitiesPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const url = `/api/activities?search=${search}&type=${type}&page=${page}&limit=${limit}`;
            const res = await authFetch(url);

            if (res.ok) {
                const data = await res.json();
                console.log("API Response:", data); // Check this in your browser console!

                // Ensure we handle the nested structure from our new backend
                setActivities(data.activities || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchActivities();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search, type, page, limit]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'stock_in': return <TrendingUp className="text-green-400" size={18} />;
            case 'stock_out': return <TrendingDown className="text-red-400" size={18} />;
            case 'new_product': return <Package className="text-blue-400" size={18} />;
            case 'category_added': return <Folder className="text-purple-400" size={18} />;
            default: return <Clock className="text-gray-400" size={18} />;
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Activity Log</h1>
                        <p className="text-gray-400">Track every change in your inventory</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>

                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-3">
                            <List className="text-gray-500 mr-2" size={18} />
                            <select
                                className="bg-transparent text-white py-2 outline-none cursor-pointer"
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                            >
                                <option value={10}>10 rows</option>
                                <option value={25}>25 rows</option>
                                <option value={50}>50 rows</option>
                            </select>
                        </div>

                        <select
                            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg outline-none cursor-pointer"
                            value={type}
                            onChange={(e) => { setType(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Types</option>
                            <option value="stock_in">Stock In</option>
                            <option value="stock_out">Stock Out</option>
                            <option value="new_product">Products</option>
                            <option value="category_added">Categories</option>
                            <option value="category_updated">Category Updates</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/50 text-gray-400 text-sm uppercase">
                                <th className="px-6 py-4 font-semibold">Activity</th>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold text-right">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                Array(limit).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={3} className="px-6 py-6 bg-gray-900/50">
                                            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : activities.length > 0 ? (
                                activities.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-800 rounded-lg">{getIcon(log.type)}</div>
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium truncate">{log.description}</p>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{log.type.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">{log.operator}</td>
                                        <td className="px-6 py-4 text-gray-400 text-xs text-right">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center text-gray-500">
                                        No activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
                        <span className="text-sm text-gray-400">
                            Page <span className="text-white font-medium">{page}</span> of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => setPage(p => p - 1)}
                                className="p-2 bg-gray-800 text-white rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage(p => p + 1)}
                                className="p-2 bg-gray-800 text-white rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}