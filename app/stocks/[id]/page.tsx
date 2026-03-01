'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, EditIcon, PackageIcon, CameraIcon, MonitorIcon, CpuIcon, BatteryIcon, WeightIcon } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  storage?: string;
  ram?: string;
  category: number;
  categoryName?: string;
  specifications?: {
    model?: string;
    display?: string;
    resolution?: string;
    os?: string;
    chipset?: string;
    main_camera?: string;
    selfie_camera?: string;
    battery?: string;
    charging?: string;
    charging_port?: string;
    weight?: string;
    dimensions?: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockProduct: Product = {
      id: parseInt(params.id as string),
      name: 'iPhone 15 Pro Max',
      price: 1199.99,
      quantity: 25,
      image: '/placeholder-phone.jpg',
      color: 'Titanium Blue',
      storage: '256GB',
      ram: '8GB',
      category: 1,
      categoryName: 'SmartPhone Category',
      specifications: {
        model: 'iPhone 15 Pro Max',
        display: '6.7 inches',
        resolution: '2796 x 1290 pixels',
        os: 'iOS 17',
        chipset: 'A17 Pro',
        main_camera: '48MP',
        selfie_camera: '12MP',
        battery: '4422 mAh',
        charging: 'Fast charging 27W',
        charging_port: 'USB Type-C',
        weight: '221 g',
        dimensions: '159.9 x 76.7 x 8.25 mm'
      }
    };
    
    setProduct(mockProduct);
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
              <p className="text-gray-400 mt-1">Product Details</p>
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.quantity > 0 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {product.quantity > 0 ? `${product.quantity} units in stock` : 'Out of stock'}
                      </span>
                      <span className="text-2xl font-bold text-blue-500">${product.price.toFixed(2)}</span>
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
                    <p className="text-white font-medium">{product.categoryName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Specifications */}
            {product.specifications && (
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
                    {product.specifications.display && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Display Size</span>
                        <span className="text-white">{product.specifications.display}</span>
                      </div>
                    )}
                    {product.specifications.resolution && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Resolution</span>
                        <span className="text-white">{product.specifications.resolution}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <CpuIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Performance
                    </h4>
                    {product.specifications.os && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Operating System</span>
                        <span className="text-white">{product.specifications.os}</span>
                      </div>
                    )}
                    {product.specifications.chipset && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Chipset</span>
                        <span className="text-white">{product.specifications.chipset}</span>
                      </div>
                    )}
                  </div>

                  {/* Camera Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <CameraIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Camera
                    </h4>
                    {product.specifications.main_camera && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Main Camera</span>
                        <span className="text-white">{product.specifications.main_camera}</span>
                      </div>
                    )}
                    {product.specifications.selfie_camera && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Selfie Camera</span>
                        <span className="text-white">{product.specifications.selfie_camera}</span>
                      </div>
                    )}
                  </div>

                  {/* Battery Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <BatteryIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Battery & Power
                    </h4>
                    {product.specifications.battery && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Battery Capacity</span>
                        <span className="text-white">{product.specifications.battery}</span>
                      </div>
                    )}
                    {product.specifications.charging && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Charging</span>
                        <span className="text-white">{product.specifications.charging}</span>
                      </div>
                    )}
                    {product.specifications.charging_port && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Charging Port</span>
                        <span className="text-white">{product.specifications.charging_port}</span>
                      </div>
                    )}
                  </div>

                  {/* Physical Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <WeightIcon className="h-4 w-4 mr-2 text-gray-400" />
                      Physical
                    </h4>
                    {product.specifications.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weight</span>
                        <span className="text-white">{product.specifications.weight}</span>
                      </div>
                    )}
                    {product.specifications.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions</span>
                        <span className="text-white">{product.specifications.dimensions}</span>
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
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
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
                  <span className="text-white font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value</span>
                  <span className="text-white font-medium">${(product.price * product.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
