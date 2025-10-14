"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import {
  Home,
  Users,
  MessageSquare,
  Heart,
  Plus,
  User,
  Settings,
  Search,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  // Example messages data
  const [messages] = useState([
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Hi! I\'m interested in being roommates. Are you still looking?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '2',
      sender: 'Mike Chen',
      content: 'Thanks for liking my roommate profile! Would love to chat about the apartment.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: '3',
      sender: 'Alex Rivera',
      content: 'Hey, I saw your listing for the shared room. Is it still available?',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  // Get user name and initials
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    function getUserName() {
      if (session?.user?.name) return session.user.name;
      const profile = localStorage.getItem('roommate_profile');
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          return parsed.name || parsed.occupation || 'User';
        } catch {}
      }
      return sessionStorage.getItem('user_name') || 'User';
    }
    setUserName(getUserName());
  }, [session?.user?.name]);

  interface NameParts {
    firstName: string;
    lastName?: string;
  }

  const userInitials: string = userName.split(' ')
    .map((n: string): string => n[0])
    .join('')
    .toUpperCase();

  interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
    read: boolean;
  }

  const unreadCount = messages.filter(m => !m.read).length;

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sticky header (fixed 64px height for consistent sticky offsets) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 transition-all duration-200">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-gray-900 dark:text-white">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200"
              aria-label="Open menu"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/dashboard" className="flex flex-col items-start">
              <img src="/Images/apartLogo.avif" alt="Convenient Rental" className="w-10 h-10 rounded-md object-cover" />
               <p className="text-sm text-gray-700 dark:text-white mt-1">We make house hunting worthwhile and easy, bringing you comfort and peace within your budget.....</p>
            </Link>
           

          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                console.log('Theme toggle clicked');
                toggleTheme();
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            {/* Notifications Bell */}
            <div className="relative">
              <button
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsNotificationsOpen(true)}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {/* Notifications Modal */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button onClick={() => setIsNotificationsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-900">
                    {messages.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No new notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {messages.map((message) => (
                          <div key={message.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!message.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {message.sender[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {message.sender}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {message.timestamp.toLocaleDateString()}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                  {message.content}
                                </p>
                                {!message.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userInitials}
              </div>
              <span className="font-medium">{userName}</span>
              {session && (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="ml-3 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main area: sidebar is full-bleed on the left, content stays in a container */}
      <div className="flex min-h-[calc(100vh-4rem)]"> {/* 4rem = 64px header */}
        {/* Desktop Sidebar - FIXED: Added proper dark mode background */}
        <aside className="hidden md:flex w-64 shrink-0 bg-white dark:bg-gray-800">
          <div className="flex-1 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl p-4 text-gray-900 dark:text-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">Menu</span>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Content area with container and padding */}
        <div className="flex-1">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}