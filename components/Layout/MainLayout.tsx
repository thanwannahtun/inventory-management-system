'use client';

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthGuard } from '../Auth/AuthGuard';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar with mobile state control */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div
          className="flex-1 flex flex-col min-w-0 "
        // className="flex-1 flex flex-col min-w-0 lg:pl-64"
        >
          {/* Note: lg:pl-64 must match your Sidebar's desktop width */}
          <Header onMenuClick={toggleSidebar} />

          <main className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}