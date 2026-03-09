// 'use client';


'use client';

import React, { useState, useEffect, use } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, PlusIcon, XIcon, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductData, Specification } from '@/lib/interface';
import { authFetch } from '@/lib/api-client';

interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

export default function EditStockPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [formData, setFormData] = useState<any>({
        name: '',
        price: 0,
        quantity: 0, // This will be read-only
        color: '',
        storage: '',
        ram: '',
        category: 0,
        specification: {
            model: '', display: '', resolution: '', os: '', chipset: '',
            main_camera: '', selfie_camera: '', battery: '', charging: '',
            charging_port: '', weight: '', dimensions: ''
        },
    });

    const [showSpecifications, setShowSpecifications] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    authFetch(`/api/products/${id}`),
                    authFetch('/api/categories')
                ]);

                if (prodRes.ok && catRes.ok) {
                    const data = await prodRes.json();
                    const categoriesData = await catRes.json();
                    setCategories(categoriesData);

                    // FIFO Logic: Extract data from the nested 'product' object
                    const p = data.product; 
                    setFormData({
                        name: p.name,
                        price: p.price,
                        quantity: p.quantity, // Managed by batches, not form
                        color: p.color || '',
                        storage: p.storage || '',
                        ram: p.ram || '',
                        category: data.category?.id || 0,
                        specification: data.specification || formData.specification
                    });

                    if (data.specification) setShowSpecifications(true);
                } else {
                    router.push('/stocks');
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('spec_')) {
            const specField = name.replace('spec_', '');
            setFormData((prev: any) => ({
                ...prev,
                specification: { ...prev.specification, [specField]: value }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        // Remove 'quantity' from the payload to prevent accidental overwrites
        const { quantity, ...payload } = formData;

        try {
            const response = await authFetch(`/api/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...payload,
                    specifications: showSpecifications ? formData.specification : null
                }),
            });

            if (response.ok) {
                router.push(`/stocks/${id}`); // Go back to details
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            alert('Failed to update product.');
        } finally {
            setIsSaving(false);
        }
    };

    const specificationFields: (keyof Specification)[] = [
        "model", "display", "resolution", "os", "chipset", "main_camera",
        "selfie_camera", "battery", "charging", "charging_port", "weight", "dimensions",
    ];

    if (isLoading) return (
        <MainLayout>
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        </MainLayout>
    );

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="flex items-center space-x-4">
                    <Link href={`/stocks/${id}`} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit {formData.name}</h1>
                        <p className="text-gray-400 mt-1">Update product details and technical specs</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <h2 className="text-xl font-bold text-white mb-6">General Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Selling Price ($)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>

                            {/* FIFO QUANTITY PROTECTION */}
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 md:col-span-2">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                                    <div>
                                        <label className="block text-sm font-bold text-blue-400 mb-1">Current Stock (Locked)</label>
                                        <p className="text-2xl font-bold text-white">{formData.quantity} Units</p>
                                        <p className="text-xs text-blue-300/70 mt-1 italic">
                                            Quantity is calculated automatically from active batches. To change stock, use the "Purchase Order" or "Sales" modules.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                                <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Storage</label>
                                <input type="text" name="storage" value={formData.storage} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">RAM</label>
                                <input type="text" name="ram" value={formData.ram} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Specifications Section */}
                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
                            <button type="button" onClick={() => setShowSpecifications(!showSpecifications)} className="text-blue-500 hover:text-blue-400 text-sm font-medium">
                                {showSpecifications ? 'Hide Specs' : 'Show Specs'}
                            </button>
                        </div>
                        {showSpecifications && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {specificationFields.map((key) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-gray-400 mb-2 capitalize">{key.replace('_', ' ')}</label>
                                        <input type="text" name={`spec_${key}`} value={formData.specification?.[key] || ''} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <Link href={`/stocks/${id}`} className="px-6 py-2 text-gray-400 hover:text-white transition-colors">Cancel</Link>
                        <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-8 py-2 rounded-lg flex items-center space-x-2 transition-all font-bold">
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                            <span>{isSaving ? 'Saving Changes...' : 'Save Product Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}

// import React, { useState, useEffect, use } from 'react';
// import { MainLayout } from '@/components/Layout/MainLayout';
// import { ArrowLeftIcon, SaveIcon, PlusIcon, XIcon, Loader2 } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { ProductData, Specification } from '@/lib/interface';
// import { authFetch } from '@/lib/api-client';

// interface Category {
//     id: number;
//     name: string;
//     is_active: boolean;
// }

// export default function EditStockPage({ params }: { params: Promise<{ id: string }> }) {
//     const router = useRouter();
//     const { id } = use(params); // Unwrap the dynamic route ID

//     const [formData, setFormData] = useState<ProductData>({
//         name: '',
//         price: 0,
//         quantity: 0,
//         color: '',
//         storage: '',
//         ram: '',
//         category: 0,
//         specification: {
//             model: '',
//             display: '',
//             resolution: '',
//             os: '',
//             chipset: '',
//             main_camera: '',
//             selfie_camera: '',
//             battery: '',
//             charging: '',
//             charging_port: '',
//             weight: '',
//             dimensions: ''
//         },
//     });

//     const [showSpecifications, setShowSpecifications] = useState(false);
//     const [categories, setCategories] = useState<Category[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const [prodRes, catRes] = await Promise.all([
//                     authFetch(`/api/products/${id}`),
//                     authFetch('/api/categories')
//                 ]);

//                 if (prodRes.ok && catRes.ok) {
//                     const product = await prodRes.json();
//                     const categoriesData = await catRes.json();

//                     setCategories(categoriesData);

//                     // Map API data to form state
//                     setFormData({
//                         ...product,
//                         category: product.category, // Assuming API returns 'category' as ID
//                         specification: product.specification || formData.specification
//                     });

//                     if (product.specification) setShowSpecifications(true);
//                 } else {
//                     alert("Product not found");
//                     router.push('/stocks/search');
//                 }
//             } catch (error) {
//                 console.error('Error loading data:', error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchData();
//     }, [id, router]);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;

//         if (name.startsWith('spec_')) {
//             const specField = name.replace('spec_', '');
//             setFormData(prev => ({
//                 ...prev,
//                 specification: { ...prev.specification, [specField]: value }
//             }));
//         } else {
//             setFormData(prev => ({ ...prev, [name]: value }));
//         }
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsSaving(true);

//         try {
//             const response = await authFetch(`/api/products/${id}`, {
//                 method: 'PUT',
//                 body: JSON.stringify({
//                     ...formData,
//                     specifications: showSpecifications ? formData.specification : null
//                 }),
//             });

//             if (response.ok) {
//                 alert('Product updated successfully!');
//                 router.refresh(); // Refresh server-side data
//             } else {
//                 const error = await response.json();
//                 alert(`Error: ${error.error}`);
//             }
//         } catch (error) {
//             console.error('Error updating product:', error);
//             alert('Failed to update product.');
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const specificationFields: (keyof Specification)[] = [
//         "model",
//         "display",
//         "resolution",
//         "os",
//         "chipset",
//         "main_camera",
//         "selfie_camera",
//         "battery",
//         "charging",
//         "charging_port",
//         "weight",
//         "dimensions",
        
//     ];

//     if (isLoading) {
//         return (
//             <MainLayout>
//                 <div className="flex h-screen items-center justify-center">
//                     <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
//                 </div>
//             </MainLayout>
//         );
//     }

//     return (
//         <MainLayout>
//             <div className="max-w-4xl mx-auto space-y-6 pb-20">
//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                         <Link href="/stocks/search" className="p-2 text-gray-400 hover:text-white transition-colors">
//                             <ArrowLeftIcon className="h-5 w-5" />
//                         </Link>
                      
//                              <div>
//               <h1 className="text-3xl font-bold text-white">{formData.name}</h1>
//               <p className="text-gray-400 mt-1">Edit Stock</p>
//             </div>
//                     </div>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Basic Information */}
//                     <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
//                         <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div className="md:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Product Name *</label>
//                                 <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
//                                 <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
//                                     <option value="">Select Category</option>
//                                     {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Price ($) *</label>
//                                 <input type="number" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Quantity *</label>
//                                 <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none" />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
//                                 <input type="text" name="color" value={formData.color || ''} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Storage</label>
//                                 <input type="text" name="storage" value={formData.storage || ''} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-300 mb-2">Ram</label>
//                                 <input type="text" name="ram" value={formData.ram || ''} onChange={handleInputChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none" />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Technical Specifications Section (Reused from Add Page) */}
//                     <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
//                         <div className="flex items-center justify-between mb-6">
//                             <h2 className="text-xl font-bold text-white">Technical Specifications</h2>
//                             <button type="button" onClick={() => setShowSpecifications(!showSpecifications)} className="text-gray-400 hover:text-white">
//                                 {showSpecifications ? <XIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
//                             </button>
//                         </div>
//                         {showSpecifications && (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {specificationFields.map((key) => (
//                                     <div key={key}>
//                                         <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
//                                             {key.replace('_', ' ')}
//                                         </label>
//                                         <input
//                                             type="text"
//                                             name={`spec_${key}`}
//                                             value={formData.specification?.[key] || ''}
//                                             onChange={handleInputChange}
//                                             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
//                                         />
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     <div className="flex items-center justify-end space-x-4">
//                         <Link href="/stocks/search" className="px-6 py-2 text-gray-300 hover:text-white">Cancel</Link>
//                         <button
//                             type="submit"
//                             disabled={isSaving}
//                             className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//                         >
//                             {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
//                             <span>{isSaving ? 'Updating...' : 'Update Product'}</span>
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </MainLayout>
//     );
// }