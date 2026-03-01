'use client';

import React, { useEffect, useState, use } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    is_active: boolean;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params); // Unwrapping params in React 19

    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        is_active: true
    });

    const [categoriesData, setCategoriesData] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both the current category and the list of all categories for the dropdown
                const [catRes, allCatsRes] = await Promise.all([
                    fetch(`/api/categories/${id}`),
                    fetch('/api/categories')
                ]);

                if (catRes.ok && allCatsRes.ok) {
                    const currentCategory = await catRes.json();
                    const allCategories = await allCatsRes.json();

                    setFormData({
                        name: currentCategory.name,
                        parent_id: currentCategory.parent_id?.toString() || '',
                        is_active: currentCategory.is_active
                    });

                    // Filter out the current category from the parent list to prevent self-referencing
                    setCategoriesData(allCategories.filter((c: Category) => c.id !== parseInt(id)));
                } else {
                    alert("Category not found");
                    router.push('/categories');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                    is_active: formData.is_active
                }),
            });

            if (response.ok) {
                alert('Category updated successfully!');
                router.push('/categories');
                router.refresh(); // Refresh server components
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/categories" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit Category</h1>
                        <p className="text-gray-400 mt-1">Update details for {formData.name}</p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="parent_id" className="block text-sm font-medium text-gray-300 mb-2">
                                Parent Category
                            </label>
                            <select
                                id="parent_id"
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="">None (Root Category)</option>
                                {categoriesData.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
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
                                className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
                                Active Status
                            </label>
                        </div>

                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
                            <Link href="/categories" className="px-4 py-2 text-gray-300 hover:text-white">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                                <span>{isSaving ? 'Updating...' : 'Update Category'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}