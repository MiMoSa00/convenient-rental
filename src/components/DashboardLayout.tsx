"use client";
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { MessageProvider } from '@/context/MessageContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
  <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RF</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 truncate">RoommateFinder</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto text-gray-900 dark:text-gray-100">
          <Sidebar 
            onNavigate={() => setSidebarOpen(false)}
            className="space-y-1"
          />
        </div>
      </div>

      {/* Main content */}
  <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white dark:bg-transparent">
        {/* Mobile top bar */}
  <div className="lg:hidden bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">RF</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">RoommateFinder</h1>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
  <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <MessageProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </MessageProvider>
  );
};

export default DashboardLayout;