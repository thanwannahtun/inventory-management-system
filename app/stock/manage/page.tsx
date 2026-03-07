'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SearchIcon, PlusIcon, PackageIcon, TrendingUpIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';
import Link from 'next/link';
import { ProductData, StockBatch } from '@/lib/interface';
import { authFetch } from '@/lib/api-client';

export default function StockManagementPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [addStockForm, setAddStockForm] = useState({
    productId: 0,
    quantity: 0,
    purchasePrice: 0
  });

  useEffect(() => {
    fetchStockStatus();
  }, []);

  const fetchStockStatus = async () => {
    try {
      const response = await authFetch('/api/stock');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching stock status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addStockForm.productId === 0 || !addStockForm.quantity || !addStockForm.purchasePrice) {
      alert('Please select a product and fill in all fields');
      return;
    }

    try {
      const response = await authFetch('/api/stock', {
        method: 'POST',
        body: JSON.stringify(addStockForm)
      });

      if (response.ok) {
        alert('Stock added successfully!');
        setAddStockForm({ productId: 0, quantity: 0, purchasePrice: 0 });
        setShowAddStock(false);
        fetchStockStatus();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = products.reduce((sum, product) => sum + (product.inventoryValue || 0), 0);
  const totalStockItems = products.reduce((sum, product) => sum + (product.quantity || 0), 0);

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Stock Management</h1>
            <p className="text-gray-400 mt-1">Manage inventory with FIFO tracking</p>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
              <PackageIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Stock Items</p>
                <p className="text-2xl font-bold text-white">{totalStockItems}</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Inventory Value</p>
                <p className="text-2xl font-bold text-white">${totalInventoryValue.toFixed(2)}</p>
              </div>
              <DollarSignIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-gray-400">{product.categoryRelation?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${product.price}</p>
                  <p className="text-sm text-gray-400">Selling Price</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Total Quantity</p>
                  <p className="text-lg font-semibold text-white">{product.quantity || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg Cost Price</p>
                  <p className="text-lg font-semibold text-white">${(product.averageCost || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Inventory Value</p>
                  <p className="text-lg font-semibold text-white">${(product.inventoryValue || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Potential Profit</p>
                  <p className="text-lg font-semibold text-green-400">
                    ${((product.price - (product.averageCost || 0)) * (product.quantity || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Stock Batches */}
              {product.stockBatches && product.stockBatches.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Stock Batches (FIFO)</h4>
                  <div className="space-y-2">
                    {product.stockBatches.map((batch) => (
                      <div key={batch.id} className="flex items-center justify-between bg-gray-800 rounded p-3">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-sm text-gray-400">Batch #{batch.id}</p>
                            <p className="text-xs text-gray-500">{new Date(batch.receivedDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{batch.remainingQuantity} units</p>
                            <p className="text-xs text-gray-400">of {batch.initialQuantity} initial</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${batch.purchasePrice}</p>
                          <p className="text-xs text-gray-400">per unit</p>
                          <p className="text-xs text-green-400">Value: ${(batch.remainingQuantity * batch.purchasePrice).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 mt-4">
                <Link href={`/stock-out/${product.id}`} className="text-blue-400 hover:text-blue-300">
                  View Details
                </Link>
                <Link
                  href={`/stock-out/new?productId=${product.id}`}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Stock Out
                </Link>
                <button
                  onClick={() => {
                    setAddStockForm({
                      productId: product?.id ?? 0,
                      quantity: 0,
                      purchasePrice: 0
                    });
                    setShowAddStock(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Stock</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Stock Modal */}
        {showAddStock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Add Stock</h3>
              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
                  <select
                    disabled={addStockForm.productId !== 0}
                    value={addStockForm.productId}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, productId: parseInt(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="0">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={addStockForm.quantity || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddStockForm(prev => ({
                        ...prev,
                        quantity: value === '' ? 0 : parseInt(value)
                      }));
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Purchase Price</label>
                  <input
                    type="number"
                    value={addStockForm.purchasePrice || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddStockForm(prev => ({
                        ...prev,
                        purchasePrice: value === '' ? 0 : parseFloat(value)
                      }));
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStock(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
