'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
  PackageIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  FolderIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { authFetch } from '@/lib/api-client';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockItems: number;
  totalValue: number;
  todayStockIn: number;
  todayStockOut: number;
}

interface RecentActivity {
  id: number;
  type: 'stock_in' | 'stock_out' | 'new_product' | 'category_added';
  description: string;
  timestamp: string;
  operator: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    lowStockItems: 0,
    totalValue: 0,
    todayStockIn: 0,
    todayStockOut: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    // Mock data - replace with API calls
    const mockStats: DashboardStats = {
      totalProducts: 0,
      totalCategories: 0,
      lowStockItems: 0,
      totalValue: 0,
      todayStockIn: 0,
      todayStockOut: 0
    };

    const fetchStats = async () => {
      try {

        // Fetching both Stats and Activity in parallel
        const [statsRes, activityRes] = await Promise.all([
          authFetch('/api/dashboard/stats'),
          authFetch(`/api/activities?limit=${20}`)
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          // CHANGE THIS LINE:
          setRecentActivity(activityData.activities || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);

        setStats(mockStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'stock_in':
        return <TrendingUpIcon className="h-4 w-4 text-green-400" />;
      case 'stock_out':
        return <TrendingDownIcon className="h-4 w-4 text-red-400" />;
      case 'new_product':
        return <PackageIcon className="h-4 w-4 text-blue-400" />;
      case 'category_added':
        return <FolderIcon className="h-4 w-4 text-purple-400" />;
      default:
        return <PackageIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'stock_in':
        return 'bg-green-900 text-green-300';
      case 'stock_out':
        return 'bg-red-900 text-red-300';
      case 'new_product':
        return 'bg-blue-900 text-blue-300';
      case 'category_added':
        return 'bg-purple-900 text-purple-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your inventory management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Products */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-900 rounded-lg">
                <PackageIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-purple-900 rounded-lg">
                <FolderIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.lowStockItems}</p>
              </div>
              <div className="p-3 bg-yellow-900 rounded-lg">
                <AlertTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Total Value */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white mt-1">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-900 rounded-lg">
                <DollarSignIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href="/stocks/add"
              className="flex items-center justify-center p-4 bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <PackageIcon className="h-5 w-5 text-blue-300 mr-2" />
              <span className="text-blue-300 font-medium">Add New Stock</span>
            </a>
            <a
              href="/stock-out/new"
              className="flex items-center justify-center p-4 bg-red-900 hover:bg-red-800 rounded-lg transition-colors"
            >
              <TrendingDownIcon className="h-5 w-5 text-red-300 mr-2" />
              <span className="text-red-300 font-medium">Stock Out</span>
            </a>
            <a
              href="/categories/add"
              className="flex items-center justify-center p-4 bg-purple-900 hover:bg-purple-800 rounded-lg transition-colors"
            >
              <FolderIcon className="h-5 w-5 text-purple-300 mr-2" />
              <span className="text-purple-300 font-medium">Add Category</span>
            </a>
            <a
              href="/stocks/search"
              className="flex items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <PackageIcon className="h-5 w-5 text-gray-300 mr-2" />
              <span className="text-gray-300 font-medium">Search Products</span>
            </a>
          </div>
        </div>
        {/* Today's Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Movement */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Today's Stock Movement</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-900 rounded-lg">
                    <TrendingUpIcon className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Stock In</p>
                    <p className="text-gray-400 text-sm">Products added today</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-400">+{stats.todayStockIn}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-900 rounded-lg">
                    <TrendingDownIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Stock Out</p>
                    <p className="text-gray-400 text-sm">Products removed today</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-400">-{stats.todayStockOut}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-900 rounded-lg">
                    <PackageIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Net Movement</p>
                    <p className="text-gray-400 text-sm">Difference in stock</p>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stats.todayStockIn - stats.todayStockOut >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
                  }`}>
                  {stats.todayStockIn - stats.todayStockOut > 0 ? '+' : ''}{stats.todayStockIn - stats.todayStockOut}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}

          <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-full lg:max-h-[600px] max-h-[400px] overflow-y-auto mb-10">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 sticky top-0 rounded-t-xl z-10">
              <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              <Link href="/activities" className="text-xs text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="group p-3 hover:bg-gray-800/50 rounded-lg transition-all border border-transparent hover:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg shrink-0 group-hover:bg-gray-700">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-200 text-sm leading-tight line-clamp-2">{activity.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getActivityColor(activity.type)}`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-gray-500">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-10 text-sm">No recent activity</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout >
  );
}
