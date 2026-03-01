'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, PlusIcon, XIcon } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  parent_id?: number;
  is_active: boolean;
}

interface ProductFormData {
  name: string;
  price: string;
  quantity: string;
  color: string;
  storage: string;
  ram: string;
  category: string;
  specifications: {
    model: string;
    display: string;
    resolution: string;
    os: string;
    chipset: string;
    main_camera: string;
    selfie_camera: string;
    battery: string;
    charging: string;
    charging_port: string;
    weight: string;
    dimensions: string;
  };
}

export default function AddStockPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    quantity: '',
    color: '',
    storage: '',
    ram: '',
    category: '',
    specifications: {
      model: '',
      display: '',
      resolution: '',
      os: '',
      chipset: '',
      main_camera: '',
      selfie_camera: '',
      battery: '',
      charging: '',
      charging_port: '',
      weight: '',
      dimensions: ''
    }
  });

  const [showSpecifications, setShowSpecifications] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('spec_')) {
      const specField = name.replace('spec_', '');
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        color: formData.color || null,
        storage: formData.storage || null,
        ram: formData.ram || null,
        category: parseInt(formData.category),
        specifications: showSpecifications ? formData.specifications : null
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Product saved successfully:', result);
        
        // Show success message and redirect
        alert('Product added successfully!');
        window.location.href = '/stocks/search';
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/stocks/search" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Add New Stock</h1>
              <p className="text-gray-400 mt-1">Add a new product to your inventory</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

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
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Black, Silver, Blue"
                />
              </div>

              {/* Storage */}
              <div>
                <label htmlFor="storage" className="block text-sm font-medium text-gray-300 mb-2">
                  Storage
                </label>
                <input
                  type="text"
                  id="storage"
                  name="storage"
                  value={formData.storage}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 256GB, 512GB, 1TB"
                />
              </div>

              {/* RAM */}
              <div>
                <label htmlFor="ram" className="block text-sm font-medium text-gray-300 mb-2">
                  RAM
                </label>
                <input
                  type="text"
                  id="ram"
                  name="ram"
                  value={formData.ram}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., 8GB, 16GB, 32GB"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
              <button
                type="button"
                onClick={() => setShowSpecifications(!showSpecifications)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showSpecifications ? <XIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
              </button>
            </div>

            {showSpecifications && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Model */}
                <div>
                  <label htmlFor="spec_model" className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    id="spec_model"
                    name="spec_model"
                    value={formData.specifications.model}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., iPhone 15 Pro Max"
                  />
                </div>

                {/* Display */}
                <div>
                  <label htmlFor="spec_display" className="block text-sm font-medium text-gray-300 mb-2">
                    Display Size
                  </label>
                  <input
                    type="text"
                    id="spec_display"
                    name="spec_display"
                    value={formData.specifications.display}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 6.7 inches"
                  />
                </div>

                {/* Resolution */}
                <div>
                  <label htmlFor="spec_resolution" className="block text-sm font-medium text-gray-300 mb-2">
                    Resolution
                  </label>
                  <input
                    type="text"
                    id="spec_resolution"
                    name="spec_resolution"
                    value={formData.specifications.resolution}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 2796 x 1290 pixels"
                  />
                </div>

                {/* OS */}
                <div>
                  <label htmlFor="spec_os" className="block text-sm font-medium text-gray-300 mb-2">
                    Operating System
                  </label>
                  <input
                    type="text"
                    id="spec_os"
                    name="spec_os"
                    value={formData.specifications.os}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., iOS 17, Android 14"
                  />
                </div>

                {/* Chipset */}
                <div>
                  <label htmlFor="spec_chipset" className="block text-sm font-medium text-gray-300 mb-2">
                    Chipset
                  </label>
                  <input
                    type="text"
                    id="spec_chipset"
                    name="spec_chipset"
                    value={formData.specifications.chipset}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., A17 Pro, Snapdragon 8 Gen 3"
                  />
                </div>

                {/* Main Camera */}
                <div>
                  <label htmlFor="spec_main_camera" className="block text-sm font-medium text-gray-300 mb-2">
                    Main Camera
                  </label>
                  <input
                    type="text"
                    id="spec_main_camera"
                    name="spec_main_camera"
                    value={formData.specifications.main_camera}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 48MP"
                  />
                </div>

                {/* Selfie Camera */}
                <div>
                  <label htmlFor="spec_selfie_camera" className="block text-sm font-medium text-gray-300 mb-2">
                    Selfie Camera
                  </label>
                  <input
                    type="text"
                    id="spec_selfie_camera"
                    name="spec_selfie_camera"
                    value={formData.specifications.selfie_camera}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 12MP"
                  />
                </div>

                {/* Battery */}
                <div>
                  <label htmlFor="spec_battery" className="block text-sm font-medium text-gray-300 mb-2">
                    Battery
                  </label>
                  <input
                    type="text"
                    id="spec_battery"
                    name="spec_battery"
                    value={formData.specifications.battery}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 4422 mAh"
                  />
                </div>

                {/* Charging */}
                <div>
                  <label htmlFor="spec_charging" className="block text-sm font-medium text-gray-300 mb-2">
                    Charging
                  </label>
                  <input
                    type="text"
                    id="spec_charging"
                    name="spec_charging"
                    value={formData.specifications.charging}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Fast charging 27W"
                  />
                </div>

                {/* Charging Port */}
                <div>
                  <label htmlFor="spec_charging_port" className="block text-sm font-medium text-gray-300 mb-2">
                    Charging Port
                  </label>
                  <input
                    type="text"
                    id="spec_charging_port"
                    name="spec_charging_port"
                    value={formData.specifications.charging_port}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., USB Type-C, Lightning"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="spec_weight" className="block text-sm font-medium text-gray-300 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    id="spec_weight"
                    name="spec_weight"
                    value={formData.specifications.weight}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 221 g"
                  />
                </div>

                {/* Dimensions */}
                <div>
                  <label htmlFor="spec_dimensions" className="block text-sm font-medium text-gray-300 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    id="spec_dimensions"
                    name="spec_dimensions"
                    value={formData.specifications.dimensions}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., 159.9 x 76.7 x 8.25 mm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/stocks/search"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <SaveIcon className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
