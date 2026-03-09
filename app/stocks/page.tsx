// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { MainLayout } from '@/components/Layout/MainLayout';
// import { SearchIcon, FilterIcon, EyeIcon, EditIcon, PackageIcon, ChevronRight, HomeIcon } from 'lucide-react';
// import { Category } from '@/db/models/Category';
// import { ProductData } from '@/lib/interface';
// import { authFetch } from '@/lib/api-client';

// export default function StockSearchPage() {
//   const [products, setProducts] = useState<ProductData[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
//   const [priceRange, setPriceRange] = useState({ min: '', max: '' });
//   const [inStockOnly, setInStockOnly] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showFilters, setShowFilters] = useState(false);

//   const [categoriesData, setCategoriesData] = useState<Category[]>([]);
//   const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [prodRes, catRes] = await Promise.all([
//           authFetch('/api/products'),
//           authFetch('/api/categories')
//         ]);
//         if (prodRes.ok) setProducts(await prodRes.json());
//         if (catRes.ok) setCategoriesData(await catRes.json());
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setIsLoading(false);
//         setIsCategoriesLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // LOGIC: Get all descendant IDs for a category to allow "Deep Filtering"
//   const getDescendantIds = (catId: number, allCats: any[]): number[] => {
//     const children = allCats.filter(c => c.parent_id === catId);
//     let ids = [catId];
//     children.forEach(child => {
//       ids = [...ids, ...getDescendantIds(child.id, allCats)];
//     });
//     return ids;
//   };

//   const filteredProducts = useMemo(() => {
//     const targetIds = selectedCategoryId ? getDescendantIds(selectedCategoryId, categoriesData) : [];

//     return products.filter(product => {
//       const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));

//       // DEEP FILTER LOGIC: Match if the product's category is the selected one OR any of its children
//       const matchesCategory = !selectedCategoryId || targetIds.includes(Number(product.categoryId));

//       const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
//         (!priceRange.max || product.price <= parseFloat(priceRange.max));
//       const matchesStock = !inStockOnly || product.quantity > 0;

//       return matchesSearch && matchesCategory && matchesPrice && matchesStock;
//     });
//   }, [products, searchTerm, selectedCategoryId, priceRange, inStockOnly, categoriesData]);

//   // UI LOGIC: Determine which categories to show in the "Drill Down"
//   const currentLevelCategories = categoriesData.filter(c =>
//     selectedCategoryId ? c.parent_id === selectedCategoryId : c.parent_id === null
//   );

//   const selectedCategoryObj = categoriesData.find(c => c.id === selectedCategoryId);


//   /// --------
//   // 1. LOGIC: Compute the full breadcrumb path for the current selection
//   const categoryPath = useMemo(() => {
//     const path: Category[] = [];
//     let currentId = selectedCategoryId;

//     while (currentId) {
//       const cat = categoriesData.find(c => c.id === currentId);
//       if (cat) {
//         path.unshift(cat);
//         currentId = cat.parent_id ?? null;
//       } else {
//         break;
//       }
//     }
//     return path;
//   }, [selectedCategoryId, categoriesData]);

//   // 2. LOGIC: Filter only immediate children of the current selection
//   const currentLevelChildren = useMemo(() => {
//     return categoriesData.filter(c => c.parent_id === selectedCategoryId);
//   }, [selectedCategoryId, categoriesData]);
//   /// --------
//   return (
//     <MainLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-white">Search Stocks</h1>
//             <p className="text-gray-400 mt-1">Found {filteredProducts.length} items in total</p>
//           </div>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
//           >
//             <FilterIcon className="h-5 w-5" />
//             <span>Advanced Filters</span>
//           </button>
//         </div>

//         {/* Dynamic Navigation & Search */}
//         <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4">
//           <div className="relative">
//             <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
//             <input
//               type="text"
//               placeholder="Search by name, specs, or model..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//             />
//           </div>

//           {/* Drill-down Category Navigator */}
//           <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-950 rounded-lg border border-gray-800">
//             <button
//               onClick={() => setSelectedCategoryId(null)}
//               className={`p-2 rounded-md flex items-center gap-2 text-sm transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
//             >
//               <HomeIcon className="h-4 w-4" />
//               Root
//             </button>

//             {selectedCategoryObj && (
//               <>
//                 <ChevronRight className="h-4 w-4 text-gray-700" />
//                 <span className="px-3 py-1.5 bg-gray-800 text-blue-400 rounded-md text-sm font-bold border border-blue-500/30">
//                   {selectedCategoryObj.name}
//                 </span>
//               </>
//             )}

//             <div className="h-6 w-px bg-gray-800 mx-2" />

//             {/* Sub-categories current level */}
//             <div className="flex flex-wrap gap-2">
//               {currentLevelCategories.map(cat => (
//                 <button
//                   key={cat.id}
//                   onClick={() => setSelectedCategoryId(Number(cat.id))}
//                   className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-md text-xs border border-gray-800 hover:border-gray-600 transition-all"
//                 >
//                   {cat.name}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* /// ---- */}
//           {/* REFINED DRILL-DOWN NAVIGATOR */}
//           <div className="space-y-3">
//             <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
//               {/* Root Button */}
//               <button
//                 onClick={() => setSelectedCategoryId(null)}
//                 className={`flex-shrink-0 p-2 rounded-lg flex items-center gap-2 text-sm transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
//               >
//                 <HomeIcon className="h-4 w-4" />
//                 <span>Root</span>
//               </button>

//               {/* Dynamic Breadcrumbs */}
//               {categoryPath.map((cat, index) => (
//                 <div key={cat.id} className="flex items-center gap-2 flex-shrink-0">
//                   <ChevronRight className="h-4 w-4 text-gray-700" />
//                   <button
//                     onClick={() => setSelectedCategoryId(cat.id)}
//                     className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${index === categoryPath.length - 1
//                         ? 'bg-blue-500/10 border-blue-500 text-blue-400'
//                         : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white'
//                       }`}
//                   >
//                     {cat.name}
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {/* Sub-categories Box (Only shows if children exist) */}
//             {currentLevelChildren.length > 0 ? (
//               <div className="flex flex-wrap gap-2 p-3 bg-gray-950/50 rounded-xl border border-gray-800/50">
//                 <p className="w-full text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-1">
//                   Explore {selectedCategoryId ? 'Subcategories' : 'Root Categories'}
//                 </p>
//                 {currentLevelChildren.map(cat => (
//                   <button
//                     key={cat.id}
//                     onClick={() => setSelectedCategoryId(cat.id)}
//                     className="group flex items-center gap-2 px-3 py-2 bg-gray-900 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs border border-gray-800 transition-all shadow-sm"
//                   >
//                     <span>{cat.name}</span>
//                     <ChevronRight className="h-3 w-3 opacity-50 group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 ))}
//               </div>
//             ) : selectedCategoryId && (
//               <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
//                 <p className="text-[10px] text-emerald-500/60 font-medium italic">
//                   Showing all products inside "{categoryPath[categoryPath.length - 1]?.name}" (Deepest level)
//                 </p>
//               </div>
//             )}
//           </div>
//           {/* /// ---- */}

//           {showFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-2">
//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Range</label>
//                 <div className="flex items-center gap-2">
//                   <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
//                   <span className="text-gray-700">-</span>
//                   <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Availability</label>
//                 <label className="flex items-center gap-3 p-2 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer hover:border-blue-500/50">
//                   <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="h-5 w-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500" />
//                   <span className="text-sm text-gray-300">Show In-Stock Only</span>
//                 </label>
//               </div>

//               <div className="flex items-end">
//                 <button
//                   onClick={() => { setSelectedCategoryId(null); setPriceRange({ min: '', max: '' }); setInStockOnly(false); setSearchTerm(''); }}
//                   className="text-xs text-gray-500 hover:text-red-400 underline underline-offset-4"
//                 >
//                   Reset All Filters
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Results Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map((product) => (
//             <div key={product.id} className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
//               <div className="h-40 bg-gray-950 relative flex items-center justify-center border-b border-gray-800">
//                 <PackageIcon className="h-12 w-12 text-gray-800 group-hover:text-blue-900 transition-colors" />
//                 <div className="absolute top-3 right-3">
//                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${product.quantity > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
//                     {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
//                   </span>
//                 </div>
//               </div>

//               <div className="p-5 space-y-4">
//                 <div>
//                   <h3 className="text-white font-semibold truncate" title={product.name}>{product.name}</h3>
//                   <p className="text-xs text-blue-400 font-mono mt-1">{product?.category?.name || 'Uncategorized'}</p>
//                 </div>

//                 <div className="flex items-baseline justify-between">
//                   <p className="text-2xl font-black text-white">${Number(product.price).toLocaleString()}</p>
//                   <p className="text-xs text-gray-500 italic">Qty: {product.quantity}</p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-2">
//                   <button onClick={() => window.location.href = `/stocks/${product.id}`} className="bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-xs font-bold transition-all">View</button>
//                   <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-900/20">Edit</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {filteredProducts.length === 0 && !isLoading && (
//           <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
//             <SearchIcon className="h-12 w-12 text-gray-700 mx-auto mb-4" />
//             <p className="text-gray-400">No matching products found in this category.</p>
//             <button onClick={() => setSelectedCategoryId(null)} className="mt-4 text-blue-500 hover:text-blue-400 text-sm font-semibold">Clear Filters</button>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// }


'use client';

import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SearchIcon, FilterIcon, PackageIcon, ChevronRight, HomeIcon } from 'lucide-react';
import { Category } from '@/db/models/Category';
import { ProductData } from '@/lib/interface';
import { authFetch } from '@/lib/api-client';

export default function StockSearchPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // We store a flattened version of the categories for easier lookup/filtering
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          authFetch('/api/products'),
          authFetch('/api/categories?nested=true')
        ]);

        if (prodRes.ok) setProducts(await prodRes.json());

        if (catRes.ok) {
          const nestedData = await catRes.json();
          // Flatten the nested structure once for efficient logic processing
          const flattened: Category[] = [];
          const flatten = (items: any[]) => {
            items.forEach(item => {
              flattened.push(item);
              if (item.children && item.children.length > 0) {
                flatten(item.children);
              }
            });
          };
          flatten(nestedData);
          setFlatCategories(flattened);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // LOGIC: Recursive helper to get all child IDs for deep product filtering
  const getDescendantIds = (catId: number, allCats: Category[]): number[] => {
    let ids = [catId];
    const children = allCats.filter(c => c.parent_id === catId);
    children.forEach(child => {
      ids = [...ids, ...getDescendantIds(child.id, allCats)];
    });
    return ids;
  };

  // LOGIC: Filter products based on search, price, stock, and DEEP category matching
  const filteredProducts = useMemo(() => {
    const targetIds = selectedCategoryId ? getDescendantIds(selectedCategoryId, flatCategories) : [];

    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = !selectedCategoryId || targetIds.includes(Number(product.categoryId));

      const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || product.price <= parseFloat(priceRange.max));

      const matchesStock = !inStockOnly || product.quantity > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });
  }, [products, searchTerm, selectedCategoryId, priceRange, inStockOnly, flatCategories]);

  // LOGIC: Compute the full breadcrumb path (Root > Parent 1 > Parent 2)
  const categoryPath = useMemo(() => {
    const path: Category[] = [];
    let currentId = selectedCategoryId;

    while (currentId) {
      const cat = flatCategories.find(c => c.id === currentId);
      if (cat) {
        path.unshift(cat);
        currentId = cat.parent_id ?? null;
      } else break;
    }
    return path;
  }, [selectedCategoryId, flatCategories]);

  // LOGIC: Get immediate children of the currently selected category for the navigator box
  const currentLevelChildren = useMemo(() => {
    return flatCategories.filter(c => c.parent_id === selectedCategoryId);
  }, [selectedCategoryId, flatCategories]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Search Stocks</h1>
            <p className="text-gray-400 mt-1">
              {isLoading ? 'Loading inventory...' : `Showing ${filteredProducts.length} items`}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all border ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
              }`}
          >
            <FilterIcon className="h-5 w-5" />
            <span className="font-semibold text-sm">Filters</span>
          </button>
        </div>

        {/* Global Search & Drill-down Navigator */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-5 shadow-xl">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, specs, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-4">
            {/* Breadcrumb Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`shrink-0 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${!selectedCategoryId ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                <HomeIcon className="h-3.5 w-3.5" />
                All Inventory
              </button>

              {categoryPath.map((cat, index) => (
                <div key={cat.id} className="flex items-center gap-2 shrink-0">
                  <ChevronRight className="h-4 w-4 text-gray-700" />
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${index === categoryPath.length - 1
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      }`}
                  >
                    {cat.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Tunneling Selection Box */}
            <div className="bg-gray-950/50 rounded-xl border border-gray-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  {currentLevelChildren.length > 0 ? 'Select Sub-Category' : 'Deepest Level Reached'}
                </span>
              </div>

              {currentLevelChildren.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {currentLevelChildren.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className="group flex flex-col items-start p-3 bg-gray-900 hover:bg-blue-600 border border-gray-800 hover:border-blue-400 rounded-xl transition-all text-left"
                    >
                      <span className="text-gray-300 group-hover:text-white text-sm font-semibold mb-1 truncate w-full">
                        {cat.name}
                      </span>
                      <div className="flex items-center text-[10px] text-gray-600 group-hover:text-blue-100">
                        <span>Open</span>
                        <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 border border-dashed border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-600 italic">No further sub-categories for this selection.</p>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters Drawer */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-gray-800 animate-in fade-in slide-in-from-top-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 transition-all"
                  />
                  <span className="text-gray-700">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stock Status</label>
                <label className="flex items-center gap-3 p-2.5 bg-gray-950 rounded-lg border border-gray-800 cursor-pointer hover:border-blue-500/50 transition-all">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => setInStockOnly(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300 font-medium">Available Only</span>
                </label>
              </div>

              <div className="flex items-end pb-1">
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPriceRange({ min: '', max: '' });
                    setInStockOnly(false);
                    setSearchTerm('');
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-tighter"
                >
                  Reset All Search Parameters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
              <div className="h-44 bg-gray-950 relative flex items-center justify-center border-b border-gray-800">
                <PackageIcon className="h-16 w-16 text-gray-800 group-hover:scale-110 group-hover:text-blue-900/40 transition-all duration-500" />
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${product.quantity > 0
                    ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                    : 'bg-red-500/5 text-red-500 border-red-500/20'
                    }`}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight truncate group-hover:text-blue-400 transition-colors" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold px-1.5 py-0.5 bg-gray-800 rounded">
                      {product?.category?.name || 'Stock'}
                    </span>
                    {product.color && (
                      <span className="text-[10px] text-gray-400 font-medium">{product.color}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-black text-white">
                    ${Number(product.price).toLocaleString()}
                  </p>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Available</p>
                    <p className="text-sm font-mono text-gray-300">{product.quantity} units</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => window.location.href = `/stocks/${product.id}`}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-700"
                  >
                    Details
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/30">
                    Edit Stock
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-32 bg-gray-950/40 rounded-3xl border-2 border-dashed border-gray-800">
            <div className="bg-gray-900 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching products</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
              We couldn't find anything matching your current filters in this specific category.
            </p>
            <button
              onClick={() => { setSelectedCategoryId(null); setSearchTerm(''); }}
              className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/40"
            >
              Reset Category to Root
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}