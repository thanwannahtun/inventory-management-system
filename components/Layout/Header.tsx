'use client';

import { SearchIcon, BellIcon, UserIcon, LogOutIcon, MenuIcon } from 'lucide-react';
import { useAuth } from '@/components/Auth/AuthGuard';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        {/* Search Bar - Hidden on very small screens, visible on md+ */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-black/40 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-gray-400 hover:text-white relative">
            <BellIcon size={20} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full border-2 border-gray-900"></span>
          </button>

          <div className="flex items-center pl-2 border-l border-gray-800">
            <div className="hidden sm:block text-right mr-3">
              <p className="text-sm font-medium text-white line-clamp-1">Admin User</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin</p>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 bg-gray-800 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOutIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}