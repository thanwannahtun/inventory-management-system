'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon, PackageIcon, UserIcon, CalendarIcon, DollarSignIcon, BarChart3Icon } from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/api-client';

// Updated interface to match your FIFO API response
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
  costPrice: number; // Added from FIFO
  totalValue: number;
  totalCost: number;  // Added from FIFO
  profit: number;     // Added from FIFO
  notes?: string;
}

export default function StockOutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<StockOutRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      try {
        const response = await authFetch(`/api/stock-out/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setRecord(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) fetchRecord();
  }, [params.id]);

  // const handleDelete = async () => {
  //   if (!confirm("Are you sure? This will return the stock to its original batch.")) return;

  //   setIsDeleting(true);
  //   try {
  //     const response = await authFetch(`/api/stock-out/${params.id}`, { method: 'DELETE' });
  //     if (response.ok) {
  //       router.push('/stock-out');
  //       router.refresh();
  //     } else {
  //       alert("Failed to reverse stock-out.");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

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

  if (isLoading) return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    </MainLayout>
  );

  if (!record) return (
    <MainLayout>
      <div className="text-center py-12">
        <p className="text-gray-400">Stock out record not found</p>
        <Link href="/stock-out" className="text-blue-500 hover:underline mt-4 inline-block">Go Back</Link>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* <Link href="/stock-out" className="p-2 text-gray-400 hover:text-white"> */}
            <ArrowLeftIcon className="h-5 w-5" onClick={() => router.back()} />
            {/* </Link> */}
            <div>
              <h1 className="text-3xl font-bold text-white">Stock Out Details</h1>
              <p className="text-gray-400 mt-1">Transaction #{record.id}</p>
            </div>
          </div>
          {/* <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
            <span>{isDeleting ? 'Reversing...' : 'Void & Return Stock'}</span>
          </button> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                  <p className="text-lg font-medium text-white">{record.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Selling Price</p>
                  <p className="text-lg font-medium text-white">${record.unitPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Quantity Sold</p>
                  <p className="text-lg font-medium text-red-400">-{record.quantity} units</p>
                </div>
              </div>
            </div>

            {/* Financial Performance (The FIFO Benefit) */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 sm:p-6 bg-linear-to-br from-gray-900 to-slate-900">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2 text-green-500" />
                Financial Impact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">

                <div className="p-3 sm:p-4 bg-black/30 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                    Revenue
                  </p>
                  <p className="text-base sm:text-xl font-bold text-white wrap-break-word">
                    ${record.totalValue.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-black/30 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                    Cost of Sales
                  </p>
                  <p className="text-base sm:text-xl font-bold text-orange-400 wrap-break-word">
                    ${record.totalCost.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 sm:p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-green-400 uppercase tracking-wider font-bold">
                    Gross Profit
                  </p>
                  <p className="text-base sm:text-xl font-bold text-green-400 wrap-break-word">
                    ${record.profit.toLocaleString()}
                  </p>
                </div>

              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                Timeline
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400">Recorded Date</p>
                  <p className="text-white">{new Date(record.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Processed By</p>
                  <p className="text-white">{record.operator}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Reason</p>
                  <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getReasonColor(record.reason)}`}>
                    {record.reason}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}