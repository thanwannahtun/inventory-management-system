'use client';

import React, { useEffect, useState, use } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, Loader2, XCircleIcon, LayersIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api-client';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  is_active: boolean;
  children: Category[];
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    is_active: true
  });

  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, allCatsRes] = await Promise.all([
        authFetch(`/api/categories/${id}`),
        authFetch('/api/categories')
      ]);

      if (catRes.ok && allCatsRes.ok) {
        const currentCategory = await catRes.json();
        const allCategories = await allCatsRes.json();

        setFormData({
          name: currentCategory.name,
          parent_id: currentCategory.parent_id?.toString() || '',
          is_active: currentCategory.is_active
        });

        // Subcategories: logic filter where parent_id matches current ID
        // setSubCategories(allCategories.filter((c: Category) => c.parent_id === parseInt(id)));
        setSubCategories((currentCategory as Category).children);

        // Dropdown: exclude current category and its direct children to prevent circular loops
        setCategoriesData(allCategories.filter((c: Category) =>
          c.id !== parseInt(id) && c.parent_id !== parseInt(id)
        ));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handle removing a subcategory (detaching it from this parent)
  const handleDetachChild = async (childId: number) => {
    if (!confirm('Are you sure you want to move this subcategory to the Root level?')) return;

    try {
      const response = await authFetch(`/api/categories/${childId}`, {
        method: 'PUT',
        body: JSON.stringify({ parent_id: null }), // Remove the link
      });

      if (response.ok) {
        // Refresh local data to show the child has been removed from the list
        fetchData();
      }
    } catch (error) {
      alert('Failed to detach subcategory');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await authFetch(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        }),
      });

      if (response.ok) {
        alert('Category updated successfully!');
        router.push('/categories');
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <MainLayout><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/categories" className="p-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Category</h1>
              <p className="text-gray-400 mt-1">Adjust details and manage hierarchy</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">General Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Parent Category</label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none"
                >
                  <option value="">None (Root Category)</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">Active Status</label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Subcategories List Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <LayersIcon className="h-5 w-5 text-blue-500" />
                Children
              </h2>
              <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                {subCategories.length} Total
              </span>
            </div>

            <div className="space-y-3">
              {subCategories.length > 0 ? (
                subCategories.map((child) => (
                  <div key={child.id} className="group flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-500 transition-all">
                    <div>
                      <p className="text-sm font-medium text-white">{child.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {child.is_active ? '● Active' : '○ Inactive'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDetachChild(child.id)}
                      title="Detach from parent"
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 italic">No subcategories found.</p>
                </div>
              )}
            </div>

            <Link
              href={`/categories/add?parent_id=${id}`}
              className="mt-6 block text-center py-2 px-4 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:text-blue-400 hover:border-blue-400 transition-all"
            >
              + Add Subcategory
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}