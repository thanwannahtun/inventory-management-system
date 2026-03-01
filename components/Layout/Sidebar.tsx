'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  SearchIcon, 
  FolderIcon, 
  PackageIcon, 
  TrendingDownIcon,
  HomeIcon,
  UserIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Search Stocks', href: '/stocks/search', icon: SearchIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Add Stock', href: '/stocks/add', icon: PackageIcon },
  { name: 'Stock Out', href: '/stock-out', icon: TrendingDownIcon },
  { name: 'User Management', href: '/admin/users', icon: UserIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 min-h-screen border-r border-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Stock Manager</h1>
        <p className="text-gray-400 text-sm mt-1">Inventory Management System</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
