'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SearchIcon, FilterIcon, EyeIcon, EditIcon, PackageIcon } from 'lucide-react';
import { Category } from '@/db/models/Category';
import { ProductData } from '@/lib/interface';
import { authFetch } from '@/lib/api-client';

export default function StockSearchPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);


  useEffect(() => {

    const fetchProducts = async () => {
      try {
        const response = await authFetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const response = await authFetch('/api/categories');
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product?.categoryId.toString() === selectedCategory;
    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || product.price <= parseFloat(priceRange.max));
    const matchesStock = !inStockOnly || product.quantity > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  const handleEdit = (product: ProductData) => {
    // Navigate to edit page or open edit modal
    window.location.href = `/stocks/${product.id}`;
  };

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
            <h1 className="text-3xl font-bold text-white">Search Stocks</h1>
            <p className="text-gray-400 mt-1">Search and filter through your inventory</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FilterIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, color, or specifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
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
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="9999"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Stock Filter */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="inStockOnly"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 bg-gray-800 border-gray-600 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="inStockOnly" className="ml-2 text-sm text-gray-300">
                  In Stock Only
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="text-gray-400">
          Found {filteredProducts.length} products
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors">
              {/* Product Image */}
              <div className="h-48 bg-gray-800 flex items-center justify-center">
                <PackageIcon className="h-16 w-16 text-gray-600" />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">{product.name}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.quantity > 0
                    ? 'bg-green-900 text-green-300'
                    : 'bg-red-900 text-red-300'
                    }`}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-400">
                  <p className="text-xl font-bold text-white">${Number(product.price).toFixed(2)}</p>
                  {product.color && <p>Color: {product.color}</p>}
                  {product.storage && <p>Storage: {product.storage}</p>}
                  {product.ram && <p>RAM: {product.ram}</p>}
                  {product.category?.name && <p>Category: {product?.category?.name}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <button onClick={() => handleEdit(product)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>                  </button>
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors">
                    <EditIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <SearchIcon className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
