'use client';

import React, { useEffect, useState, use } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import {
    SaveIcon, Loader2, XCircleIcon,
    LayersIcon, ChevronRightIcon, ExternalLinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/api-client';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    is_active: boolean;
    children: Category[];
    parent?: Category;
}

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { id } = use(params);
    const isRootFlag = searchParams.get('is_root'); // Detect is_root from URL

    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        is_active: true
    });

    const [categoriesData, setCategoriesData] = useState<Category[]>([]);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Helper to generate breadcrumbs from nested parent object
    const getBreadcrumbs = (category: Category | null) => {
        const chain: Category[] = [];
        let curr = category?.parent;
        while (curr) {
            chain.unshift(curr);
            curr = curr.parent;
        }
        return chain;
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const catRes = await authFetch(`/api/categories/${id}`);

            if (catRes.ok) {
                const cat = await catRes.json();
                setCurrentCategory(cat);
                setFormData({
                    name: cat.name,
                    parent_id: cat.parent_id?.toString() || '',
                    is_active: cat.is_active
                });

                // 2. Handle Parent Selection List based on is_root flag
                if (isRootFlag) {
                    // Fetch full list of categories as requested
                    const allCatsRes = await authFetch('/api/categories');
                    if (allCatsRes.ok) {
                        const allCategories = await allCatsRes.json();
                        // Prevent circular reference
                        const forbiddenIds = new Set([cat.id, ...(cat.children?.map((c: any) => c.id) || [])]);
                        setCategoriesData(allCategories.filter((c: Category) => !forbiddenIds.has(c.id)));
                    }
                } else {
                    //  Take the category from the response's parent as the only available parent
                    if (cat.parent) {
                        setCategoriesData([cat.parent]);
                    } else {
                        setCategoriesData([]);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, isRootFlag]);

    const handleDetachChild = async (childId: number) => {
        if (!confirm('Move this subcategory to Root level?')) return;
        try {
            const response = await authFetch(`/api/categories/${childId}`, {
                method: 'PUT',
                body: JSON.stringify({ parent_id: null }),
            });
            if (response.ok) fetchData();
        } catch (error) {
            alert('Failed to detach');
        }
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
                router.refresh();
                alert('Saved!');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <MainLayout><div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div></MainLayout>;

    const breadcrumbs = getBreadcrumbs(currentCategory);

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-20">

                {/* Dynamic Breadcrumbs using the nested 'parent' object */}
                <nav className="flex items-center space-x-2 text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <Link href="/categories" className="hover:text-white">Categories</Link>
                    <ChevronRightIcon className="h-4 w-4" />
                    {breadcrumbs.map((bc) => (
                        <React.Fragment key={bc.id}>
                            <Link href={`/categories/${bc.id}`} className="hover:text-white max-w-[100px] truncate">
                                {bc.name}
                            </Link>
                            <ChevronRightIcon className="h-4 w-4" />
                        </React.Fragment>
                    ))}
                    <span className="text-blue-400 font-medium">{currentCategory?.name} (ID: {id})</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT: Main Edit Form */}
                    <div className="lg:col-span-7 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                        <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800">
                            <h2 className="text-lg font-semibold text-white">General Information</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Parent Category</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none"
                                >
                                    <option value="">None (Root)</option>
                                    {categoriesData.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} {!isRootFlag && '(Locked Parent)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center p-4 bg-gray-950 rounded-lg border border-gray-800">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-5 w-5 rounded border-gray-700 text-blue-600 focus:ring-blue-500 bg-gray-900"
                                />
                                <label htmlFor="is_active" className="ml-3 text-sm text-gray-300">Category is visible and active in sales/inventory</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/20"
                            >
                                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <SaveIcon className="h-5 w-5" />}
                                <span>Update Category Details</span>
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: Infinite Children Explorer */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <LayersIcon className="h-5 w-5 text-blue-500" />
                                    Subcategories
                                </h2>
                                <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                    {currentCategory?.children?.length || 0}
                                </span>
                            </div>

                            <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {currentCategory?.children && currentCategory.children.length > 0 ? (
                                    <div className="grid gap-2">
                                        {currentCategory.children.map((child) => (
                                            <div key={child.id} className="group flex items-center bg-gray-950 border border-gray-800 rounded-lg p-1 hover:border-blue-500/50 transition-all">
                                                <Link
                                                    href={`/categories/${child.id}`}
                                                    className="grow flex items-center p-3"
                                                >
                                                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-blue-600 transition-colors">
                                                        <span className="text-xs text-white">{child.id}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors">{child.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase">View Details</p>
                                                    </div>
                                                    <ExternalLinkIcon className="h-3 w-3 ml-auto text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>

                                                <button
                                                    onClick={() => handleDetachChild(child.id)}
                                                    className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                                                >
                                                    <XCircleIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-lg">
                                        <p className="text-gray-500 text-sm italic">This is a leaf category<br />(No sub-items)</p>
                                    </div>
                                )}
                            </div>

                            <Link
                                href={`/categories/add?parent_id=${id}`}
                                className="m-4 block text-center py-3 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-blue-400 font-semibold transition-all"
                            >
                                + Create New Subcategory Here
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}