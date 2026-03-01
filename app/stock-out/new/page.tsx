'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { ProductData } from '@/lib/interface';


interface StockOutFormData {
  productId: string;
  quantity: string;
  reason: string;
  notes: string;
}

export default function NewStockOutPage() {
  const [formData, setFormData] = useState<StockOutFormData>({
    productId: '',
    quantity: '',
    reason: 'Sale',
    notes: ''
  });

  const [products, setProducts] = useState<ProductData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockProducts: ProductData[] = [
    ];

    setProducts(mockProducts);
    setIsLoading(false);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.quantity > 0
  );

  const handleProductSelect = (product: ProductData) => {
    setFormData(prev => ({
      ...prev,
      productId: (product?.id ?? 0).toString()
    }));
    setSelectedProduct(product);
    setSearchTerm(product.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !formData.quantity) {
      alert('Please select a product and enter quantity');
      return;
    }

    try {
      const response = await fetch('/api/stock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: parseInt(formData.productId),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          notes: formData.notes,
          operator: 'Current User' // Replace with actual user from auth
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Stock out processed successfully:', result);

        // Redirect to stock out page or detail page
        window.location.href = '/stock-out';
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error processing stock out:', error);
      alert('Failed to process stock out. Please try again.');
    }
  };

  const totalValue = selectedProduct && formData.quantity
    ? selectedProduct.price * parseInt(formData.quantity)
    : 0;

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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/stock-out" className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">New Stock Out Operation</h1>
            <p className="text-gray-400 mt-1">Record a stock out transaction</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Product Selection</h2>

            {/* Product Search */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Product Suggestions */}
            {searchTerm && !selectedProduct && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          <p className="text-gray-400 text-sm">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${product.price.toFixed(2)}</p>
                          <p className="text-green-400 text-sm">{product.quantity} in stock</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-400 text-center">
                    No products found with available stock
                  </div>
                )}
              </div>
            )}

            {/* Selected Product */}
            {selectedProduct && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{selectedProduct.name}</p>
                    <p className="text-gray-400 text-sm">{selectedProduct.category}</p>
                    <p className="text-green-400 text-sm mt-1">{selectedProduct.quantity} units available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${selectedProduct.price.toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setFormData(prev => ({ ...prev, productId: '' }));
                        setSearchTerm('');
                      }}
                      className="text-red-400 hover:text-red-300 text-sm mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stock Out Details */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Stock Out Details</h2>

            <div className="space-y-6">
              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
                {selectedProduct && (
                  <p className="mt-1 text-xs text-gray-400">
                    Maximum available: {selectedProduct.quantity} units
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                  Reason *
                </label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Sale">Sale</option>
                  <option value="Return">Return</option>
                  <option value="Damage">Damage</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Loss">Loss</option>
                  <option value="Expiry">Expiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Additional notes about this stock out operation..."
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedProduct && formData.quantity && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Transaction Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Product</span>
                  <span className="text-white">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Unit Price</span>
                  <span className="text-white">${selectedProduct.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{formData.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reason</span>
                  <span className="text-white">{formData.reason}</span>
                </div>
                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-white">Total Value</span>
                    <span className="text-lg font-bold text-red-500">-${totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/stock-out"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!selectedProduct || !formData.quantity}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <SaveIcon className="h-4 w-4" />
              <span>Process Stock Out</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
