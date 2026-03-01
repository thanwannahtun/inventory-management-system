'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowUpRightIcon, HistoryIcon, SearchIcon, FilterIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

interface StockOutRecord {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
  operator: string;
  category: string;
  unitPrice: number;
  totalValue: number;
}

export default function StockOutPage() {
  const [activeTab, setActiveTab] = useState<'operations' | 'history'>('operations');
  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from API
    const fetchStockOutRecords = async () => {
      try {
        const response = await fetch('/api/stock-out');
        if (response.ok) {
          const data = await response.json();
          setStockOutRecords(data);
        }
      } catch (error) {
        console.error('Error fetching stock out records:', error);
        // Fallback to mock data
        const mockRecords: StockOutRecord[] = [
          {
            id: 1,
            productId: 1,
            productName: 'iPhone 15 Pro Max',
            quantity: 5,
            reason: 'Sale',
            date: '2024-01-15',
            operator: 'John Doe',
            category: 'SmartPhone Category',
            unitPrice: 1199.99,
            totalValue: 5999.95
          },
          {
            id: 2,
            productId: 2,
            productName: 'Samsung Galaxy S24 Ultra',
            quantity: 3,
            reason: 'Return',
            date: '2024-01-14',
            operator: 'Jane Smith',
            category: 'SmartPhone Category',
            unitPrice: 1299.99,
            totalValue: 3899.97
          },
          {
            id: 3,
            productId: 3,
            productName: 'MacBook Pro 16"',
            quantity: 2,
            reason: 'Damage',
            date: '2024-01-13',
            operator: 'Mike Johnson',
            category: 'Laptop Category',
            unitPrice: 2499.99,
            totalValue: 4999.98
          },
          {
            id: 4,
            productId: 4,
            productName: 'iPad Pro 12.9"',
            quantity: 1,
            reason: 'Transfer',
            date: '2024-01-12',
            operator: 'Sarah Wilson',
            category: 'Tablet Category',
            unitPrice: 1099.99,
            totalValue: 1099.99
          }
        ];
        setStockOutRecords(mockRecords);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockOutRecords();
  }, []);

  const filteredRecords = stockOutRecords.filter(record => {
    const matchesSearch = record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.operator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = !selectedReason || record.reason === selectedReason;
    const matchesDate = (!dateRange.start || record.date >= dateRange.start) &&
                      (!dateRange.end || record.date <= dateRange.end);
    
    return matchesSearch && matchesReason && matchesDate;
  });

  const totalQuantity = filteredRecords.reduce((sum, record) => sum + record.quantity, 0);
  const totalValue = filteredRecords.reduce((sum, record) => sum + record.totalValue, 0);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Stock Out Management</h1>
            <p className="text-gray-400 mt-1">Manage stock out operations and view history</p>
          </div>
          <Link href="/stock-out/new" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <PlusIcon className="h-5 w-5" />
            <span>New Stock Out</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('operations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'operations'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <ArrowUpRightIcon className="h-4 w-4" />
                <span>Stock Out Operations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HistoryIcon className="h-4 w-4" />
                <span>History</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Stock Out Today</p>
                <p className="text-2xl font-bold text-white mt-1">12 units</p>
              </div>
              <div className="p-3 bg-red-900 rounded-lg">
                <ArrowUpRightIcon className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Quantity</p>
                <p className="text-2xl font-bold text-white mt-1">{totalQuantity} units</p>
              </div>
              <div className="p-3 bg-blue-900 rounded-lg">
                <PlusIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white mt-1">${Number(totalValue).toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-900 rounded-lg">
                <span className="text-green-400 font-bold text-lg">$</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products or operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Reason Filter */}
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Reasons</option>
              <option value="Sale">Sale</option>
              <option value="Return">Return</option>
              <option value="Damage">Damage</option>
              <option value="Transfer">Transfer</option>
              <option value="Loss">Loss</option>
            </select>

            {/* Date Range */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />

            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Operator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{record.productName}</div>
                        <div className="text-sm text-gray-400">${Number(record.unitPrice).toFixed(2)} / unit</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                        -{record.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.reason === 'Sale' ? 'bg-green-900 text-green-300' :
                        record.reason === 'Return' ? 'bg-blue-900 text-blue-300' :
                        record.reason === 'Damage' ? 'bg-red-900 text-red-300' :
                        record.reason === 'Transfer' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {record.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {record.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      ${Number(record.totalValue).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link href={`/stock-out/${record.id}`} className="text-blue-400 hover:text-blue-300">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400">
                <HistoryIcon className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg">No stock out records found</p>
                <p className="text-sm mt-1">Try adjusting your filters or create a new stock out operation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
