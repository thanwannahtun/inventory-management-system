'use client';

import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthGuard } from '../Auth/AuthGuard';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-black text-white">
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Header />
            <main className="p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
