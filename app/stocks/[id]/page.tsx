'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon, EditIcon, PackageIcon, CameraIcon, MonitorIcon,
  CpuIcon, BatteryIcon, WeightIcon, LayersIcon, TrendingUpIcon,
  SmartphoneIcon
} from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/api-client';
import { Specification } from '@/lib/interface';

// Define the new nested interface based on your FIFO API response
interface ProductDetailResponse {
  product: {
    id: number;
    name: string;
    price: string;
    quantity: number;
    inventoryValue: number;
    averageCost: number;
    color?: string;
    storage?: string;
    ram?: string;
  };
  batches: Array<{
    id: number;
    initialQuantity: number;
    remainingQuantity: number;
    purchasePrice: string;
    receivedDate: string;
    value: number;
  }>;
  category: {
    id: number;
    name: string;
  };
  specification: Specification | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Define fields exactly like your Edit screen for consistency
  const specificationFields: (keyof Specification)[] = [
    "model", "display", "resolution", "os", "chipset", "main_camera",
    "selfie_camera", "battery", "charging", "charging_port", "weight", "dimensions",
  ];

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await authFetch(`/api/products/${params.id}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) fetchProductDetails();
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

  if (!data || !data.product) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Product not found</p>
          <Link href="/stocks" className="text-blue-500 hover:underline mt-4 inline-block">Back to Inventory</Link>
        </div>
      </MainLayout>
    );
  }

  const { product, batches, category, specification } = data;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/stocks" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <p className="text-gray-400 mt-1">FIFO Inventory Profile</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/stocks/edit/${product.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <EditIcon className="h-5 w-5" />
            <span>Edit Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Info Card */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                      <PackageIcon className="h-10 w-10 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                      <p className="text-blue-400 font-medium">{category?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Selling Price</p>
                    <p className="text-3xl font-bold text-white">${Number(product.price).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 bg-black/20 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Current Stock</p>
                    <p className={`text-lg font-bold ${product.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.quantity} Units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Avg. Cost (FIFO)</p>
                    <p className="text-lg font-bold text-white">${product.averageCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Storage</p>
                    <p className="text-lg font-bold text-white">{product.storage || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">RAM</p>
                    <p className="text-lg font-bold text-white">{product.ram || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Technical Specifications - Mapped like Edit Screen */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <SmartphoneIcon className="h-6 w-6 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                {specificationFields.map((key) => {
                  const value = specification?.[key];
                  // Only show fields that have a value
                  if (!value || value === "") return null;

                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-gray-800">
                      <span className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-sm text-white font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
              {(!specification) && (
                <p className="text-gray-500 italic text-center py-4">No technical specifications available.</p>
              )}
            </div>

            {/* Active Batches Table */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <LayersIcon className="h-5 w-5 mr-2 text-orange-500" />
                Active Inventory Batches
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-sm">
                      <th className="pb-3 font-medium">Received Date</th>
                      <th className="pb-3 font-medium text-center">Remaining</th>
                      <th className="pb-3 font-medium text-right">Unit Cost</th>
                      <th className="pb-3 font-medium text-right">Batch Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {batches.length > 0 ? batches.map(batch => (
                      <tr key={batch.id} className="text-gray-300">
                        <td className="py-4">{new Date(batch.receivedDate).toLocaleDateString()}</td>
                        <td className="py-4 text-center">{batch.remainingQuantity} / {batch.initialQuantity}</td>
                        <td className="py-4 text-right">${Number(batch.purchasePrice).toLocaleString()}</td>
                        <td className="py-4 text-right text-white font-medium">${batch.value.toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-8 text-center text-gray-500">No active stock batches found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Asset Value</span>
                  <span className="text-white font-bold">${product.inventoryValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Potential Revenue</span>
                  <span className="text-white font-bold">${(Number(product.price) * product.quantity).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-green-400 text-sm font-bold">Unrealized Profit</span>
                  <span className="text-green-400 font-bold">
                    ${((Number(product.price) * product.quantity) - product.inventoryValue).toLocaleString()}
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