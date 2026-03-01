'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, EditIcon, TrashIcon, PackageIcon, UserIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
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
  notes?: string;
}

export default function StockOutDetailPage() {
  const params = useParams();
  const [record, setRecord] = useState<StockOutRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockRecord: StockOutRecord = {
      id: parseInt(params.id as string),
      productId: 1,
      productName: 'iPhone 15 Pro Max',
      quantity: 5,
      reason: 'Sale',
      date: '2024-01-15',
      operator: 'John Doe',
      category: 'SmartPhone Category',
      unitPrice: 1199.99,
      totalValue: 5999.95,
      notes: 'Customer purchase - Order #12345'
    };
    
    setRecord(mockRecord);
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!record) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Stock out record not found</p>
        </div>
      </MainLayout>
    );
  }

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Sale': return 'bg-green-900 text-green-300';
      case 'Return': return 'bg-blue-900 text-blue-300';
      case 'Damage': return 'bg-red-900 text-red-300';
      case 'Transfer': return 'bg-yellow-900 text-yellow-300';
      case 'Loss': return 'bg-gray-900 text-gray-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/stock-out" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Stock Out Details</h1>
              <p className="text-gray-400 mt-1">Transaction #{record.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <EditIcon className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <PackageIcon className="h-5 w-5 mr-2 text-blue-500" />
                Product Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Product Name</p>
                  <p className="text-lg font-medium text-white">{record.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Category</p>
                  <p className="text-lg font-medium text-white">{record.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Unit Price</p>
                  <p className="text-lg font-medium text-white">${record.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Quantity</p>
                  <p className="text-lg font-medium text-red-400">-{record.quantity} units</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-white">Total Value</span>
                  <span className="text-2xl font-bold text-red-500">-${record.totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Transaction Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
                  <p className="text-lg font-medium text-white">#{record.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-lg font-medium text-white">{record.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Reason</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReasonColor(record.reason)}`}>
                    {record.reason}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Operator</p>
                  <p className="text-lg font-medium text-white">{record.operator}</p>
                </div>
              </div>

              {record.notes && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <p className="text-white">{record.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Print Receipt
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Export PDF
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Email Receipt
                </button>
              </div>
            </div>

            {/* Related Information */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                Operator Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{record.operator}</p>
                    <p className="text-gray-400 text-sm">Stock Manager</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-1">Employee ID</p>
                  <p className="text-white">EMP001</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Department</p>
                  <p className="text-white">Inventory Management</p>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <DollarSignIcon className="h-5 w-5 mr-2 text-blue-500" />
                Impact Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock Impact</span>
                  <span className="text-red-400 font-medium">-{record.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Value Impact</span>
                  <span className="text-red-400 font-medium">-${record.totalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction Type</span>
                  <span className="text-white font-medium">{record.reason}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
