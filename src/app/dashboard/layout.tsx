"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import * as NextAuth from "next-auth/react";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import { X, Bell, ChevronRight, Sparkles, Trash2, Users, MessageSquare } from "lucide-react";

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

interface Notification {
  id: string;
  type: 'message' | 'match' | 'system';
  sender: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: session } = NextAuth.useSession();

  // Notifications state with localStorage persistence
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('user_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('user_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Function to add notification (can be called from anywhere in your app)
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Listen for custom events to add notifications
  useEffect(() => {
    const handleRoommateMatch = (event: any) => {
      addNotification({
        type: 'match',
        sender: event.detail.name || 'New Match',
        content: `You have a ${event.detail.compatibility || 90}% compatibility match with ${event.detail.name}!`,
      });
    };

    const handleNewMessage = (event: any) => {
      addNotification({
        type: 'message',
        sender: event.detail.sender || 'Someone',
        content: event.detail.content || 'You have a new message',
      });
    };

    window.addEventListener('roommate-match', handleRoommateMatch);
    window.addEventListener('new-message', handleNewMessage);

    return () => {
      window.removeEventListener('roommate-match', handleRoommateMatch);
      window.removeEventListener('new-message', handleNewMessage);
    };
  }, []);

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

  // Calculate unread count - only show if greater than 0
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Toggle notification panel
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('user_notifications');
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Users className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Bell className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border transition-all duration-200">
        <div className="h-16 pt-1 sm:pt-1 lg:pt-2 flex items-center justify-between px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
            {/* Sparkly Mobile Menu Button */}
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

            {/* Logo */}
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
            <p className="ml-1 sm:ml-2 text-muted-foreground leading-snug whitespace-nowrap overflow-hidden text-ellipsis text-xs sm:text-sm lg:text-base max-w-[10rem] sm:max-w-[14rem] md:max-w-[20rem] lg:max-w-[26rem]">
              We make house hunting worthwhile and easy, bringing you comfort and peace within your budget.....
            </p>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
            {/* Theme Toggle - Shows Moon icon in light mode, Sun icon in dark mode */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              )}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground relative rounded-lg hover:bg-muted transition-colors"
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-medium animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Modal */}
              {isNotificationsOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={toggleNotifications}
                  />
                  
                  {/* Notification Panel */}
                  <div className="fixed md:absolute right-0 md:right-0 top-16 md:top-auto md:mt-2 w-full md:w-80 lg:w-96 max-w-md bg-card rounded-none md:rounded-lg shadow-xl border-t md:border border-border z-50 overflow-hidden max-h-[calc(100vh-4rem)] md:max-h-[32rem]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-card sticky top-0 z-10">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                          Notifications
                        </h3>
                        {notifications.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {notifications.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors group"
                            aria-label="Clear all notifications"
                            title="Clear all"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                          </button>
                        )}
                        <button
                          onClick={toggleNotifications}
                          className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
                          aria-label="Close notifications"
                        >
                          <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto bg-card" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
                      {notifications.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-muted-foreground">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Bell className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
                          </div>
                          <p className="text-sm sm:text-base font-medium mb-1">No notifications yet</p>
                          <p className="text-xs sm:text-sm text-muted-foreground/70">
                            We'll notify you when something new happens
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                                !notification.read ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                {/* Icon */}
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  notification.type === 'match' 
                                    ? 'bg-success/10 text-success' 
                                    : notification.type === 'message'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-accent/10 text-accent'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                      {notification.sender}
                                    </p>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                      {formatTimestamp(notification.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words">
                                    {notification.content}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full mt-2"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm flex-shrink-0">
                {userInitials}
              </div>
              <span className="hidden sm:inline font-medium text-xs md:text-sm lg:text-base whitespace-nowrap truncate max-w-[5rem] md:max-w-[8rem] lg:max-w-[12rem]">
                {userName}
              </span>
              {session && (
                <button
                  onClick={() => NextAuth.signOut({ callbackUrl: "/" })}
                  className="ml-1 sm:ml-2 lg:ml-3 bg-destructive text-destructive-foreground whitespace-nowrap text-[10px] sm:text-xs md:text-sm px-2 sm:px-2.5 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg hover:bg-destructive/90 transition-colors"
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
        <aside className="hidden md:flex w-64 shrink-0 bg-card border-r border-border">
          <div className="flex-1 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
              style={{
                opacity: isMobileSidebarOpen ? 0.5 : 0,
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            <div
              className="absolute left-0 top-0 h-full w-72 bg-card shadow-xl transition-transform duration-300 ease-out"
              style={{
                transform: isMobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">RF</span>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    RoomieFinder
                  </span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-muted transition-all duration-200 group"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto">
                <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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