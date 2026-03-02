'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, EditIcon, PackageIcon, CameraIcon, MonitorIcon, CpuIcon, BatteryIcon, WeightIcon } from 'lucide-react';
import Link from 'next/link';
import { ProductData } from '@/lib/interface';
import { authFetch } from '@/lib/api-client';


export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await authFetch(`/api/products/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [params.id]);



  const handleEdit = (product: ProductData) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/stocks/edit/${product.id}`;
  };


  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Product not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/stocks/search" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">{product.name}</h1>
              <p className="text-gray-400 mt-1">Stock Details</p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <EditIcon className="h-5 w-5" />
            <span>Edit Product</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image and Basic Info */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="h-80 bg-gray-800 flex items-center justify-center">
                <PackageIcon className="h-24 w-24 text-gray-600" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.quantity > 0
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                        }`}>
                        {product.quantity > 0 ? `${product.quantity} units in stock` : 'Out of stock'}
                      </span>
                      <span className="text-2xl font-bold text-blue-500">${Number(product.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Basic Specifications */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.color && (
                    <div>
                      <p className="text-sm text-gray-400">Color</p>
                      <p className="text-white font-medium">{product.color}</p>
                    </div>
                  )}
                  {product.storage && (
                    <div>
                      <p className="text-sm text-gray-400">Storage</p>
                      <p className="text-white font-medium">{product.storage}</p>
                    </div>
                  )}
                  {product.ram && (
                    <div>
                      <p className="text-sm text-gray-400">RAM</p>
                      <p className="text-white font-medium">{product.ram}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="text-white font-medium">{product.categoryRelation?.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            {product.specification && (
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CpuIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <MonitorIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Display
                    </h4>
                    {product.specification?.display && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Display Size</span>
                        <span className="text-white">{product.specification?.display}</span>
                      </div>
                    )}
                    {product.specification?.resolution && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Resolution</span>
                        <span className="text-white">{product.specification?.resolution}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <CpuIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Performance
                    </h4>
                    {product.specification?.os && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operating System</span>
                        <span className="text-white">{product.specification?.os}</span>
                      </div>
                    )}
                    {product.specification?.chipset && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Chipset</span>
                        <span className="text-white">{product.specification?.chipset}</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <CameraIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Camera
                    </h4>
                    {product.specification?.main_camera && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Main Camera</span>
                        <span className="text-white">{product.specification?.main_camera}</span>
                      </div>
                    )}
                    {product.specification?.selfie_camera && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Selfie Camera</span>
                        <span className="text-white">{product.specification?.selfie_camera}</span>
                      </div>
                    )}
                  </div>

                  {/* Battery Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <BatteryIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Battery & Power
                    </h4>
                    {product.specification?.battery && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Battery Capacity</span>
                        <span className="text-white">{product.specification?.battery}</span>
                      </div>
                    )}
                    {product.specification?.charging && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Charging</span>
                        <span className="text-white">{product.specification?.charging}</span>
                      </div>
                    )}
                    {product.specification?.charging_port && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Charging Port</span>
                        <span className="text-white">{product.specification?.charging_port}</span>
                      </div>
                    )}
                  </div>

                  {/* Physical Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <WeightIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Physical
                    </h4>
                    {product.specification?.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weight</span>
                        <span className="text-white">{product.specification?.weight}</span>
                      </div>
                    )}
                    {product.specification?.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions</span>
                        <span className="text-white">{product.specification?.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Update Stock
                </button>
                <button onClick={() => handleEdit(product)} className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Edit Product
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Delete Product
                </button>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Stock Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Stock</span>
                  <span className="text-white font-medium">{product.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unit Price</span>
                  <span className="text-white font-medium">${Number(product.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-white font-medium">${Number((product.price * product.quantity)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
