// 'use client';

// import React, { useEffect, useState, Suspense } from 'react';
// import { MainLayout } from '@/components/Layout/MainLayout';
// import { ArrowLeftIcon, SaveIcon, CheckCircle2 } from 'lucide-react';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation'; // Added for URL params
// import { Category } from '@/db/models/Category';
// import { authFetch } from '@/lib/api-client';

// function AddCategoryForm() {
//   const searchParams = useSearchParams();
//   const urlParentId = searchParams.get('parent_id'); // Grabs "11" from ?parent_id=11

//   const [formData, setFormData] = useState({
//     name: '',
//     parent_id: '',
//     is_active: true
//   });

//   const [categoriesData, setCategoriesData] = useState<Category[]>([]);
//   const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
//   const [saveSuccess, setSaveSuccess] = useState(false); // Success state

//   useEffect(() => {
//     // Set default parent from URL if present
//     if (urlParentId) {
//       setFormData(prev => ({ ...prev, parent_id: urlParentId }));
//     }

//     const fetchCategoriesData = async () => {
//       try {
//         const response = await authFetch('/api/categories');
//         if (response.ok) {
//           const data = await response.json();
//           setCategoriesData(data);
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       } finally {
//         setIsCategoriesLoading(false);
//       }
//     };
//     fetchCategoriesData();
//   }, [urlParentId]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaveSuccess(false);

//     if (!formData.name) {
//       alert('Please enter a category name');
//       return;
//     }

//     try {
//       const categoryData = {
//         name: formData.name,
//         parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
//         is_active: formData.is_active
//       };

//       const response = await authFetch('/api/categories', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(categoryData),
//       });

//       if (response.ok) {
//         setSaveSuccess(true);
//         // Clear name for next entry, but keep parent_id and active status
//         setFormData(prev => ({ ...prev, name: '' })); 
//         console.log('Category saved successfully');
//       } else {
//         const error = await response.json();
//         alert(`Error: ${error.error}`);
//       }
//     } catch (error) {
//       console.error('Error saving category:', error);
//       alert('Failed to save category.');
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
//     }));
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center space-x-4">
//         <Link href="/categories" className="p-2 text-gray-400 hover:text-white transition-colors">
//           <ArrowLeftIcon className="h-5 w-5" />
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-white">Add New Category</h1>
//           <p className="text-gray-400 mt-1">Create a new product category</p>
//         </div>
//       </div>

//       {/* Success Notification */}
//       {saveSuccess && (
//         <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg flex items-center space-x-3">
//           <CheckCircle2 className="h-5 w-5" />
//           <span>Category saved successfully! You can add another or go back.</span>
//         </div>
//       )}

//       {/* Form */}
//       <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
//               Category Name *
//             </label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
//               placeholder="Enter category name"
//             />
//           </div>

//           <div>
//             <label htmlFor="parent_id" className="block text-sm font-medium text-gray-300 mb-2">
//               Parent Category
//             </label>
//             <select
//               id="parent_id"
//               name="parent_id"
//               value={formData.parent_id}
//               onChange={handleChange}
//               className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
//             >
//               <option value="">None (Root Category)</option>
//               {isCategoriesLoading ? (
//                 <option disabled>Loading...</option>
//               ) : (
//                 categoriesData.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name}
//                   </option>
//                 ))
//               )}
//             </select>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="is_active"
//               name="is_active"
//               checked={formData.is_active}
//               onChange={handleChange}
//               className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
//             />
//             <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">Active</label>
//           </div>

//           <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-800">
//             <Link href="/categories" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
//               Back to List
//             </Link>
//             <button
//               type="submit"
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
//             >
//               <SaveIcon className="h-4 w-4" />
//               <span>Save Category</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // React 19 / Next.js 16 requires Suspense for useSearchParams in Client Components
// export default function AddCategoryPage() {
//   return (
//     <MainLayout>
//       <Suspense fallback={<div>Loading form...</div>}>
//         <AddCategoryForm />
//       </Suspense>
//     </MainLayout>
//   );
// }
// ---------------------------------------------------------
// 'use client';

// import React, { useEffect, useState, Suspense } from 'react';
// import { MainLayout } from '@/components/Layout/MainLayout';
// import { ArrowLeftIcon, SaveIcon, CheckCircle2, Loader2, InfoIcon } from 'lucide-react';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
// import { authFetch } from '@/lib/api-client';

// function AddCategoryForm() {
//   const searchParams = useSearchParams();
//   const urlParentId = searchParams.get('parent_id');

//   const [formData, setFormData] = useState({
//     name: '',
//     parent_id: '',
//     is_active: true
//   });

//   const [categoriesData, setCategoriesData] = useState<any[]>([]);
//   const [parentCategoryName, setParentCategoryName] = useState<string | null>(null);
//   const [isInitialLoading, setIsInitialLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const catResponse = await authFetch('/api/categories');
//         if (catResponse.ok) {
//           const data = await catResponse.json();
//           setCategoriesData(data);

//           // If we have a URL parent ID, find its name for the UI
//           if (urlParentId) {
//             setFormData(prev => ({ ...prev, parent_id: urlParentId }));
//             const parent = data.find((c: any) => c.id === parseInt(urlParentId));
//             if (parent) setParentCategoryName(parent.name);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsInitialLoading(false);
//       }
//     };
//     fetchData();
//   }, [urlParentId]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaveSuccess(false);
//     setIsSaving(true);

//     try {
//       const response = await authFetch('/api/categories', {
//         method: 'POST',
//         body: JSON.stringify({
//           ...formData,
//           parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
//         }),
//       });

//       if (response.ok) {
//         setSaveSuccess(true);
//         setFormData(prev => ({ ...prev, name: '' })); // Reset name for bulk entry
//         // Small delay to hide success message eventually
//         setTimeout(() => setSaveSuccess(false), 5000);
//       } else {
//         const error = await response.json();
//         alert(`Error: ${error.error}`);
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* Header & Navigation */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Link
//             href={urlParentId ? `/categories/${urlParentId}` : '/categories'}
//             className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
//           >
//             <ArrowLeftIcon className="h-5 w-5" />
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold text-white">Create New Category</h1>
//             <p className="text-gray-500 text-sm">Organize your inventory with precision</p>
//           </div>
//         </div>
//       </div>

//       {/* Context Banner: Shows when adding a subcategory */}
//       {parentCategoryName && (
//         <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
//           <div className="p-2 bg-blue-500/10 rounded-lg">
//             <InfoIcon className="h-5 w-5 text-blue-400" />
//           </div>
//           <div>
//             <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Target Location</p>
//             <p className="text-sm text-gray-300">
//               Adding this as a child of <span className="text-white font-bold">"{parentCategoryName}"</span>
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Success Notification */}
//       {saveSuccess && (
//         <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-4 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
//           <CheckCircle2 className="h-5 w-5" />
//           <span className="font-medium">Category saved! You can add another or go back.</span>
//         </div>
//       )}

//       {/* Main Form Card */}
//       <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
//         <form onSubmit={handleSubmit} className="divide-y divide-gray-800">
//           <div className="p-8 space-y-6">

//             {/* Category Name */}
//             <div>
//               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
//                 Category Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 required
//                 autoFocus
//                 className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-700"
//                 placeholder="e.g. Batteries, Screen Glass, Wireless Headphones"
//               />
//             </div>

//             {/* Parent Selection */}
//             <div>
//               <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
//                 Placement in Hierarchy
//               </label>
//               <select
//                 name="parent_id"
//                 value={formData.parent_id}
//                 onChange={(e) => {
//                   setFormData({ ...formData, parent_id: e.target.value });
//                   const selected = categoriesData.find(c => c.id === parseInt(e.target.value));
//                   setParentCategoryName(selected ? selected.name : null);
//                 }}
//                 className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
//               >
//                 <option value="">Set as Root (Top Level)</option>
//                 {categoriesData.map((cat) => (
//                   <option key={cat.id} value={cat.id}>
//                     {cat.name} {cat.id === parseInt(urlParentId || '0') ? '(Current Selection)' : ''}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Active Status Toggle */}
//             <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
//               <div>
//                 <p className="text-sm font-semibold text-white">Active Status</p>
//                 <p className="text-xs text-gray-500">Visible in sales and product creation</p>
//               </div>
//               <input
//                 type="checkbox"
//                 checked={formData.is_active}
//                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
//                 className="h-6 w-6 rounded-lg bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
//               />
//             </div>
//           </div>

//           {/* Footer Actions */}
//           <div className="p-8 bg-gray-800/30 flex items-center justify-between">
//             <Link href="/categories" className="text-sm font-semibold text-gray-500 hover:text-white transition-colors">
//               Cancel and Return
//             </Link>
//             <button
//               type="submit"
//               disabled={isSaving || isInitialLoading}
//               className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-xl font-bold flex items-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <SaveIcon className="h-5 w-5" />}
//               <span>Create Category</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default function AddCategoryPage() {
//   return (
//     <MainLayout>
//       <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>}>
//         <AddCategoryForm />
//       </Suspense>
//     </MainLayout>
//   );
// }
// ----------------------------------------------
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { ArrowLeftIcon, SaveIcon, CheckCircle2, Loader2, InfoIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/api-client';

function AddCategoryForm() {
  const searchParams = useSearchParams();
  const urlParentId = searchParams.get('parent_id');

  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    is_active: true
  });

  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [parentCategoryName, setParentCategoryName] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (urlParentId) {
          // LOGIC: If parentId is present, fetch ONLY that category
          const response = await authFetch(`/api/categories/${urlParentId}`);
          if (response.ok) {
            const parent = await response.json();
            setCategoriesData([parent]); // Only one option available in dropdown
            setFormData(prev => ({ ...prev, parent_id: urlParentId }));
            setParentCategoryName(parent.name);
          }
        } else {
          // LOGIC: If no parentId, fetch all categories for selection or keep as Root
          const response = await authFetch('/api/categories');
          if (response.ok) {
            const data = await response.json();
            setCategoriesData(data);
            setFormData(prev => ({ ...prev, parent_id: '' })); // Default to Root
            setParentCategoryName(null);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, [urlParentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const response = await authFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setFormData(prev => ({ ...prev, name: '' }));
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={urlParentId ? `/categories/${urlParentId}` : '/categories'}
            className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Category</h1>
            <p className="text-gray-500 text-sm">Organize your inventory with precision</p>
          </div>
        </div>
      </div>

      {parentCategoryName && (
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Target Location</p>
            <p className="text-sm text-gray-300">
              Adding this as a child of <span className="text-white font-bold">"{parentCategoryName}"</span>
            </p>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 p-4 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Category saved! You can add another or go back.</span>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-gray-800">
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-700"
                placeholder="e.g. Batteries, Screen Glass, Wireless Headphones"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Placement in Hierarchy
              </label>
              <select
                name="parent_id"
                value={formData.parent_id}
                onChange={(e) => {
                  setFormData({ ...formData, parent_id: e.target.value });
                  const selected = categoriesData.find(c => c.id === parseInt(e.target.value));
                  setParentCategoryName(selected ? selected.name : null);
                }}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {/* Logic: Show Root option only if not forced by urlParentId */}
                {!urlParentId && <option value="">Set as Root (Top Level)</option>}

                {categoriesData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {urlParentId ? '(Locked Parent)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div>
                <p className="text-sm font-semibold text-white">Active Status</p>
                <p className="text-xs text-gray-500">Visible in sales and product creation</p>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-6 w-6 rounded-lg bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="p-8 bg-gray-800/30 flex items-center justify-between">
            <Link href="/categories" className="text-sm font-semibold text-gray-500 hover:text-white transition-colors">
              Cancel and Return
            </Link>
            <button
              type="submit"
              disabled={isSaving || isInitialLoading}
              className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-xl font-bold flex items-center space-x-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <SaveIcon className="h-5 w-5" />}
              <span>Create Category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddCategoryPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>}>
        <AddCategoryForm />
      </Suspense>
    </MainLayout>
  );
}