"use client";
import React, { useState } from 'react';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { MessageProvider } from '@/context/MessageContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sparkly Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-[length:200%_auto] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        style={{ animation: 'gradient-shift 3s ease infinite' }}
        aria-label="Open Sidebar"
      >
        <div className="relative">
          <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
          {/* Sparkle effect */}
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" style={{ animation: 'sparkle 1s ease-in-out infinite' }} />
        </div>
      </button>

      {/* Mobile sidebar overlay with fade animation */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with smooth slide animation */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl
          lg:translate-x-0 lg:static lg:inset-0
          transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
              <span className="text-white font-bold text-sm">RF</span>
            </div>
            <h1 className="text-xl font-bold truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RoomieFinder
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-3 py-4">
            <Sidebar 
              onNavigate={() => setSidebarOpen(false)}
              className="space-y-1"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-50 dark:bg-gray-900">
        {/* Mobile top bar - Only shows when sidebar is closed */}
        <div className={`
          lg:hidden bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0
          transition-transform duration-300 ease-out
          ${sidebarOpen ? '-translate-y-full' : 'translate-y-0'}
        `}>
          <div className="flex items-center justify-center h-16 px-4 relative">
            {/* Spacer for button */}
            <div className="w-12" />
            
            {/* Centered Logo */}
            <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">RF</span>
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RoomieFinder
              </h1>
            </div>
            
            {/* Right spacer */}
            <div className="w-12" />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
      `}</style>
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