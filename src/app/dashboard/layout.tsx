"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import * as NextAuth from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import { X, Bell, ChevronRight, Sparkles } from "lucide-react";

/* Inline fallback Moon & Sun icons */
const Moon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
  </svg>
);

const Sun = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: session } = NextAuth.useSession();

  // Example messages data
  const [messages] = useState([
    {
      id: "1",
      sender: "Sarah Johnson",
      content: "Hi! I'm interested in being roommates. Are you still looking?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      sender: "Mike Chen",
      content:
        "Thanks for liking my roommate profile! Would love to chat about the apartment.",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      sender: "Alex Rivera",
      content:
        "Hey, I saw your listing for the shared room. Is it still available?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  // Get user name and initials
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    function getUserName() {
      if (session?.user?.name) return session.user.name;
      const profile = localStorage.getItem("roommate_profile");
      if (profile) {
        try {
          const parsed = JSON.parse(profile);
          return parsed.name || parsed.occupation || "User";
        } catch {}
      }
      return sessionStorage.getItem("user_name") || "User";
    }
    setUserName(getUserName());
  }, [session?.user?.name]);

  const userInitials: string = userName
    .split(" ")
    .map((n: string): string => n[0])
    .join("")
    .toUpperCase();

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 transition-all duration-200">
        <div className="h-16 pt-1 sm:pt-1 lg:pt-2 flex items-center justify-between px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto text-gray-900 dark:text-white">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
            {/* Sparkly Mobile Menu Button - Shows on mobile, hides on md+ */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite',
              }}
              aria-label="Open Sidebar"
            >
              <div className="relative">
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:translate-x-1 transition-transform" />
                <Sparkles 
                  className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-300" 
                  style={{ animation: 'sparkle 1s ease-in-out infinite' }}
                />
              </div>
            </button>

            {/* Logo - Shows on md+, hides on mobile */}
            <Link
              href="/dashboard"
              aria-label="Convenient Rental"
              className="hidden md:flex items-center shrink-0"
            >
              <Image
                src="/Images/apartLogo.avif"
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                priority
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-md object-contain shrink-0"
              />
            </Link>

            {/* Brand Text */}
            <p className="ml-1 sm:ml-2 text-gray-700 dark:text-white leading-snug whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm lg:text-base max-w-[10rem] sm:max-w-[14rem] md:max-w-[20rem] lg:max-w-[26rem]">
              We make house hunting worthwhile and easy, bringing you comfort and peace within your budget.....
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsNotificationsOpen(true)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 text-white text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Modal */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      aria-label="Close notifications"
                    >
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
                          <div
                            key={message.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              !message.read
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {message.sender[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {message.sender}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
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
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                {userInitials}
              </div>
              <span className="hidden sm:inline font-medium text-xs md:text-sm lg:text-base whitespace-nowrap truncate max-w-[5rem] md:max-w-[8rem] lg:max-w-[12rem]">
                {userName}
              </span>
              {session && (
                <button
                  onClick={() => NextAuth.signOut({ callbackUrl: "/" })}
                  className="ml-1 sm:ml-2 lg:ml-3 bg-red-500 text-white whitespace-nowrap text-[10px] sm:text-xs md:text-sm px-2 sm:px-2.5 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg hover:bg-red-600 transition-colors"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main area: sidebar and content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Sidebar with Smooth Slide Animation */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Overlay with fade animation */}
            <div
              className="absolute inset-0 bg-black backdrop-blur-sm transition-opacity duration-300"
              style={{
                opacity: isMobileSidebarOpen ? 0.5 : 0,
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar with slide animation */}
            <div
              className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-xl text-gray-900 dark:text-gray-100 transition-transform duration-300 ease-out"
              style={{
                transform: isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              }}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RF</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    RoomieFinder
                  </span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all duration-200 group"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-gray-900 dark:text-gray-100">
            {children}
          </main>
        </div>
      </div>

      {/* Custom Animations */}
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
}