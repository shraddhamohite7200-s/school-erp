import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#111c2d] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Shell */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        <TopHeader onToggleSidebar={() => setSidebarOpen(true)} />

        <main className="w-full pt-16 flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
