'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { SearchIcon, FilterIcon, EyeIcon, EditIcon, PackageIcon } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  storage?: string;
  ram?: string;
  category: number;
  categoryName?: string;
  specifications?: {
    model?: string;
    display?: string;
    resolution?: string;
    os?: string;
    chipset?: string;
    main_camera?: string;
    selfie_camera?: string;
    battery?: string;
    charging?: string;
    charging_port?: string;
    weight?: string;
    dimensions?: string;
  };
}

export default function StockSearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        price: 1199.99,
        quantity: 25,
        image: '/placeholder-phone.jpg',
        color: 'Titanium Blue',
        storage: '256GB',
        ram: '8GB',
        category: 1,
        categoryName: 'SmartPhone Category',
        specifications: {
          model: 'iPhone 15 Pro Max',
          display: '6.7 inches',
          resolution: '2796 x 1290 pixels',
          os: 'iOS 17',
          chipset: 'A17 Pro',
          main_camera: '48MP',
          selfie_camera: '12MP',
          battery: '4422 mAh',
          charging: 'Fast charging 27W',
          charging_port: 'USB Type-C',
          weight: '221 g',
          dimensions: '159.9 x 76.7 x 8.25 mm'
        }
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99,
        quantity: 15,
        image: '/placeholder-phone.jpg',
        color: 'Titanium Black',
        storage: '512GB',
        ram: '12GB',
        category: 1,
        categoryName: 'SmartPhone Category'
      },
      {
        id: 3,
        name: 'MacBook Pro 16"',
        price: 2499.99,
        quantity: 8,
        image: '/placeholder-laptop.jpg',
        color: 'Space Gray',
        storage: '1TB SSD',
        ram: '32GB',
        category: 2,
        categoryName: 'Laptop Category'
      },
      {
        id: 4,
        name: 'iPad Pro 12.9"',
        price: 1099.99,
        quantity: 0,
        image: '/placeholder-tablet.jpg',
        color: 'Silver',
        storage: '256GB',
        ram: '8GB',
        category: 3,
        categoryName: 'Tablet Category'
      }
    ];
    
    setProducts(mockProducts);
    setIsLoading(false);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.color && product.color.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.category.toString() === selectedCategory;
    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                       (!priceRange.max || product.price <= parseFloat(priceRange.max));
    const matchesStock = !inStockOnly || product.quantity > 0;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

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
                  <option value="1">SmartPhone Category</option>
                  <option value="2">Laptop Category</option>
                  <option value="3">Tablet Category</option>
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
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.quantity > 0 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-400">
                  <p className="text-xl font-bold text-white">${product.price.toFixed(2)}</p>
                  {product.color && <p>Color: {product.color}</p>}
                  {product.storage && <p>Storage: {product.storage}</p>}
                  {product.ram && <p>RAM: {product.ram}</p>}
                  {product.categoryName && <p>Category: {product.categoryName}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                    <span>View</span>
                  </button>
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
