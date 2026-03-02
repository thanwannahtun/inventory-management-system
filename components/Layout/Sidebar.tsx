'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SearchIcon, FolderIcon, PackageIcon, TrendingDownIcon,
  HomeIcon, UserIcon, XIcon, ActivityIcon
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Activities', href: '/activities', icon: ActivityIcon }, // Added this for you
  { name: 'Search Stocks', href: '/stocks/search', icon: SearchIcon },
  { name: 'Categories', href: '/categories', icon: FolderIcon },
  { name: 'Add Stock', href: '/stocks/add', icon: PackageIcon },
  { name: 'Stock Out', href: '/stock-out', icon: TrendingDownIcon },
  { name: 'User Management', href: '/admin/users', icon: UserIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Stock Manager</h1>
          <p className="text-gray-500 text-xs mt-1">Inventory System</p>
        </div>
        {/* Close button - Only visible on Mobile */}
        <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white">
          <XIcon size={20} />
        </button>
      </div>

      <nav className="mt-4 px-4 overflow-y-auto h-[calc(100vh-100px)]">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose()} // Close sidebar when link is clicked on mobile
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl mb-1 transition-all duration-200 ${isActive
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}