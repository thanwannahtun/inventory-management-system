'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import router from 'next/router';
import Link from 'next/link';
interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real data from API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to mock data
        const mockCategories: Category[] = [
          {
            id: 1,
            name: 'SmartPhone Category',
            parent_id: null,
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            children: [
              { id: 11, name: 'iPhone', parent_id: 1, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
              { id: 12, name: 'Samsung', parent_id: 1, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
            ]
          },
          {
            id: 2,
            name: 'Laptop Category',
            parent_id: null,
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
            children: [
              { id: 21, name: 'Gaming Laptops', parent_id: 2, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
              { id: 22, name: 'Business Laptops', parent_id: 2, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
            ]
          },
          {
            id: 3,
            name: 'Tablet Category',
            parent_id: null,
            is_active: true,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
          }
        ];
        setCategories(mockCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCategories(categories.filter(cat => cat.id !== id));
          alert('Category deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleEdit = (category: Category) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/categories/edit/${category.id}`;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-white">Categories</h1>
            <p className="text-gray-400 mt-1">Manage product categories and subcategories</p>
          </div>
          {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"> */}
          {/* don't use router on server side */}
          {/* <button onClick={() => router.push('/categories/create')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"> */}
          {/* <PlusIcon className="h-5 w-5" /> */}
          {/* <span>Add Category</span> */}
          {/* <form action="/categories/create" method="get">
              <button type="submit">Add Category</button>
            </form> */}
          {/* </button> */}

          <Link
            href="/categories/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Category</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.is_active
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                        }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {category.children && (
                        <span className="text-gray-400 text-sm">
                          {category.children.length} subcategories
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {category.children && category.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400 mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.children.map((child) => (
                        <span
                          key={child.id}
                          className="inline-flex items-center px-2 py-1 rounded bg-gray-800 text-gray-300 text-xs"
                        >
                          {child.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <SearchIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">No categories found</p>
              <p className="text-sm mt-1">Try adjusting your search or add a new category</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
