"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useMessages } from "@/context/MessageContext";
import {
  Home,
  Users,
  MessageSquare,
  Heart,
  Plus,
  User,
  Settings,
  Search,
  MapPin,
} from "lucide-react";

type SidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export default function Sidebar({ onNavigate, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { chats } = useMessages();

  // Calculate total unread messages
  const totalUnreadMessages = chats.reduce((total, chat) => total + chat.unreadCount, 0);

  // Sidebar items defined directly in the component
  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      label: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: totalUnreadMessages,
    },
    {
      label: "Find Roommates",
      href: "/dashboard/roommates",
      icon: Users,
    },
    {
      label: "Browse Properties",
      href: "/dashboard/browse",
      icon: Search,
    },
    {
      label: "Saved Properties",
      href: "/dashboard/favorites",
      icon: Heart,
    },
    {
      label: "My Listings",
      href: "/dashboard/listings",
      icon: Plus,
    },
    {
      label: "Nearby",
      href: "/dashboard/nearby",
      icon: MapPin,
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className={`space-y-1 ${className}`}>
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        const badgeValue = item.badge || 0;

        const baseClasses =
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 group";
        const activeClasses = isActive
          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100";

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} ${activeClasses}`}
            onClick={() => onNavigate?.()}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Icon className={`h-5 w-5 transition-colors ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-300' 
                    : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`} />
                {/* Small badge on icon for messages */}
                {item.label === 'Messages' && badgeValue > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-[16px]">
                    {badgeValue > 9 ? '9+' : badgeValue}
                  </div>
                )}
              </div>
              <span className={`font-medium truncate transition-colors ${
                isActive 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'
              }`}>
                {item.label}
              </span>
            </div>
            
            {/* Main badge (larger, on the right) */}
            {typeof badgeValue === "number" && badgeValue > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium transition-colors flex-shrink-0 ml-2 ${
                  badgeValue > 0 
                    ? "bg-red-500 text-white shadow-sm" 
                    : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                }`}
                aria-label={`${item.label} count: ${badgeValue}`}
              >
                {badgeValue > 99 ? '99+' : badgeValue}
              </span>
            )}
          </Link>
        );
      })}
      
      {/* Responsive spacing at bottom */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2">
          <p className="truncate">RoommateFinder v1.0</p>
        </div>
      </div>
    </nav>
  );
}