'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/db/models/Category';

export default function AddCategoryPage() {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    is_active: true
  });

  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategoriesData(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
      fetchCategoriesData();
  }, [])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name) {
      alert('Please enter a category name');
      return;
    }

    try {
      // Prepare category data
      const categoryData = {
        name: formData.name,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        is_active: formData.is_active
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Category saved successfully:', result);

        // Show success message and redirect
        alert('Category added successfully!');
        window.location.href = '/categories';
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/categories" className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Category</h1>
            <p className="text-gray-400 mt-1">Create a new product category</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            {/* Parent Category */}
            <div>
              <label
                htmlFor="parent_id"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Parent Category
              </label>
              <select
                id="parent_id"
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">None (Root Category)</option>
                {isCategoriesLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Select a parent category to create a subcategory
              </p>
            </div>
            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                Active
              </label>
              <p className="ml-4 text-xs text-gray-400">
                Inactive categories won't be shown in the product listings
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
              <Link
                href="/categories"
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <SaveIcon className="h-4 w-4" />
                <span>Save Category</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
