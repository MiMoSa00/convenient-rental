"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  MapPin,
  MessageSquare,
  Star,
  Heart,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { MessageProvider, useMessages } from "@/context/MessageContext";
import ThemeWrapper from "@/components/ThemeWrapper";
import ChatModal from "@/components/ChatModal";

// Types
type Listing = {
  id: number;
  title: string;
  price: string;
  location: string;
  image?: string;
  rating: number;
  type: "apartment" | "shared" | "studio" | string;
};

type RoommateMatch = {
  id: number;
  name: string;
  age: number;
  occupation: string;
  budget: string;
  compatibility: number;
  interests: string[];
};

const DashboardContent = () => {
  const { openChat, chats } = useMessages();

  // Calculate total unread messages from all chats
  const totalUnreadMessages = chats.reduce((total, chat) => total + chat.unreadCount, 0);

  // Zero defaults for a new user
  const [stats, setStats] = useState({
    savedProperties: 0,
    roommateMatches: 0,
    messages: totalUnreadMessages,
    profileViews: 0,
  });

  // Update stats when chats change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      messages: totalUnreadMessages
    }));
  }, [totalUnreadMessages]);

  // Start empty for new user
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [roommateMatches, setRoommateMatches] = useState<RoommateMatch[]>([]);

  // Helpers
  const resetStatsForNewUser = () =>
    setStats({
      savedProperties: 0,
      roommateMatches: 0,
      messages: 0,
      profileViews: 0,
    });

  const incrementSavedProperties = (amount: number = 1) =>
    setStats((s) => ({ ...s, savedProperties: s.savedProperties + amount }));

  const incrementRoommateMatches = (amount: number = 1) =>
    setStats((s) => ({ ...s, roommateMatches: s.roommateMatches + amount }));

  const incrementProfileViews = (amount: number = 1) =>
    setStats((s) => ({ ...s, profileViews: s.profileViews + amount }));

  // Listings helpers
  const addRecentListing = (listing: Listing) =>
    setRecentListings((prev) => [...prev, listing]);
  const clearRecentListings = () => setRecentListings([]);

  // Roommate matches helpers
  const addRoommateMatch = (match: RoommateMatch) => {
    setRoommateMatches((prev) => [...prev, match]);
    incrementRoommateMatches(1);
  };
  const clearRoommateMatches = () => setRoommateMatches([]);

  // Handle message button click
  const handleMessageClick = (match: RoommateMatch) => {
    openChat(match);
  };

  // Demo seed (optional)
  const seedDemoData = () => {
    const demoListings: Listing[] = [
      {
        id: 1,
        title: "Cozy 2BR Apartment Near Campus",
        price: "₦800,000/month",
        location: "Lekki, Lagos",
        image: "/api/placeholder/300/200",
        rating: 4.5,
        type: "apartment",
      },
      {
        id: 2,
        title: "Shared Room in Modern House",
        price: "₦450,000/month",
        location: "Gwarinpa, Abuja",
        image: "/api/placeholder/300/200",
        rating: 4.2,
        type: "shared",
      },
      {
        id: 3,
        title: "Studio with Kitchen Access",
        price: "₦600,000/month",
        location: "Bodija, Ibadan",
        image: "/api/placeholder/300/200",
        rating: 4.8,
        type: "studio",
      },
    ];
    const demoMatches: RoommateMatch[] = [
      {
        id: 1,
        name: "Sarah Johnson",
        age: 22,
        occupation: "Student",
        budget: "₦400,000-600,000",
        compatibility: 92,
        interests: ["Clean", "Quiet", "Non-smoker"],
      },
      {
        id: 2,
        name: "Mike Chen",
        age: 25,
        occupation: "Software Developer",
        budget: "₦500,000-700,000",
        compatibility: 87,
        interests: ["Tech", "Cooking", "Gym"],
      },
      {
        id: 3,
        name: "Adaora Okafor",
        age: 24,
        occupation: "Marketing Executive",
        budget: "₦350,000-550,000",
        compatibility: 85,
        interests: ["Fitness", "Movies", "Cooking"],
      },
    ];
    setRecentListings(demoListings);
    setRoommateMatches(demoMatches);
    setStats({
      savedProperties: 2,
      roommateMatches: demoMatches.length,
      messages: totalUnreadMessages,
      profileViews: 24,
    });
  };

  // Animations
  const cardAnimation = "transition-transform hover:-translate-y-1 hover:shadow-lg";
  const tileAnimation = "transition-transform hover:scale-[1.01] hover:shadow-md";

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="opacity-90">Find your perfect home and ideal roommate</p>
          <p className="text-sm opacity-75 mt-2">Use the sidebar to navigate to different sections</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Helpers (optional) */}
            <button
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              onClick={resetStatsForNewUser}
            >
              Reset Stats
            </button>
            <button
              className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              onClick={seedDemoData}
            >
              Seed Demo Data
            </button>
          </div>
        </div>

        {/* Quick Stats - Display Only */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`bg-white p-4 rounded-lg border border-gray-200 ${cardAnimation}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Properties</p>
                <p className="text-2xl font-bold">{stats.savedProperties}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className={`bg-white p-4 rounded-lg border border-gray-200 ${cardAnimation}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Roommate Matches</p>
                <p className="text-2xl font-bold">{stats.roommateMatches}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className={`bg-white p-4 rounded-lg border border-gray-200 ${cardAnimation} relative`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold">{stats.messages}</p>
              </div>
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-green-500" />
                {stats.messages > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.messages > 9 ? '9+' : stats.messages}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`bg-white p-4 rounded-lg border border-gray-200 ${cardAnimation}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold">{stats.profileViews}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Listings - Display Only */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Listings</h2>
              <span className="text-gray-500 text-sm">Use sidebar to browse all properties</span>
            </div>
          </div>
          <div className="p-6">
            {recentListings.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                
                <p>No recent listings yet.</p>
                <p className="text-sm text-gray-500">
                  When new listings appear, they will be shown here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`border border-gray-200 rounded-lg overflow-hidden ${tileAnimation}`}
                  >
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{listing.title}</h3>
                      <p className="text-green-600 font-bold">{listing.price}</p>
                      <p className="text-gray-600 text-sm flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm ml-1">{listing.rating}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          className="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                          onClick={() => incrementSavedProperties(1)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Roommate Matches - Display Only */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Top Roommate Matches</h2>
              <span className="text-gray-500 text-sm">Use sidebar to find all roommates</span>
            </div>
          </div>
          <div className="p-6">
            {roommateMatches.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No roommate matches made yet.</p>
                <p className="text-sm text-gray-500">
                  Complete your profile and preferences to get matches.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {roommateMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg ${tileAnimation}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {match.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {match.name}, {match.age}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {match.occupation} • {match.budget}
                        </p>
                        <div className="flex space-x-2 mt-1">
                          {match.interests.slice(0, 2).map((interest, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold">
                        {match.compatibility}% Match
                      </div>
                      <button
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                        onClick={() => handleMessageClick(match)}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatModal />
    </>
  );
};

const Dashboard = () => {
  return (
    <MessageProvider>
      <ThemeWrapper>
        <DashboardContent />
      </ThemeWrapper>
    </MessageProvider>
  );
};

export default Dashboard;