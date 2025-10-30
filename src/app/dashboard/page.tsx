"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import {
  Home,
  Users,
  MapPin,
  MessageSquare,
  Star,
  Heart,
  TrendingUp,
  Building2,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";

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
  const [userName, setUserName] = useState<string>("Guest");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Get user name from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Prompt for name on first visit
      setIsEditingName(true);
    }
  }, []);

  const saveName = () => {
    if (tempName.trim()) {
      localStorage.setItem("userName", tempName.trim());
      setUserName(tempName.trim());
      setIsEditingName(false);
      setTempName("");
    }
  };

  // Zero defaults for a new user
  const [stats, setStats] = useState({
    savedProperties: 0,
    roommateMatches: 0,
    messages: 0,
    profileViews: 0,
  });

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
    console.log("Message clicked for:", match.name);
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
      messages: 5,
      profileViews: 24,
    });
  };

  // Stats for display with design system
  const statsDisplay = [
    {
      label: "Saved Properties",
      value: stats.savedProperties.toString(),
      icon: Heart,
      gradient: "from-destructive to-red-400",
      trend: stats.savedProperties > 0 ? `+${stats.savedProperties}` : undefined,
    },
    {
      label: "Roommate Matches",
      value: stats.roommateMatches.toString(),
      icon: Users,
      gradient: "from-primary to-primary-glow",
      trend: stats.roommateMatches > 0 ? `+${stats.roommateMatches}` : undefined,
    },
    {
      label: "Messages",
      value: stats.messages.toString(),
      icon: MessageSquare,
      gradient: "from-success to-green-400",
      trend: stats.messages > 0 ? `+${stats.messages}` : undefined,
    },
    {
      label: "Profile Views",
      value: stats.profileViews.toString(),
      icon: TrendingUp,
      gradient: "from-accent to-accent-glow",
      trend: stats.profileViews > 0 ? `+${stats.profileViews}` : undefined,
    },
  ];

  return (
    <div className="min-h-full">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary-light/5 to-accent-light/5">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-mesh)' }} />
        
        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto space-y-8">
           {/* Welcome Section */}
            <div className="space-y-3 sm:space-y-4 animate-fade-in-down">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 text-xs sm:text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="truncate">Welcome back to RoomieFind</span>
              </div>
              {isEditingName ? (
                <div className="space-y-3 sm:space-y-4 animate-fade-in">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">What's your name?</h1>
                  <div className="flex gap-2 sm:gap-3 max-w-md">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveName()}
                      placeholder="Enter your name"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <Button onClick={saveName} size="lg" className="whitespace-nowrap">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] break-words">
                    Hello, {userName}! 👋
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="self-start sm:self-auto text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border transition-all"
                  >
                    ✏️ Edit name
                  </Button>
                </div>
              )}
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Find your perfect space and ideal roommate with our intelligent matching system
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                className="h-auto py-6 px-6 flex flex-col items-start gap-3 bg-gradient-to-br from-primary to-primary-glow hover:shadow-[var(--shadow-glow)] transition-all duration-500 group relative overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Building2 className="h-8 w-8 relative z-10" />
                <div className="text-left relative z-10">
                  <div className="font-semibold text-base">Browse Properties</div>
                  <div className="text-xs opacity-90">Find your dream home</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="secondary" 
                className="h-auto py-6 px-6 flex flex-col items-start gap-3 hover:bg-accent hover:text-accent-foreground transition-all duration-500 group"
                size="lg"
              >
                <Users className="h-8 w-8" />
                <div className="text-left">
                  <div className="font-semibold text-base">Find Roommates</div>
                  <div className="text-xs opacity-70">Connect with matches</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-6 px-6 flex flex-col items-start gap-3 hover:bg-card hover:border-primary transition-all duration-500 group"
                size="lg"
                onClick={seedDemoData}
              >
                <Plus className="h-8 w-8" />
                <div className="text-left">
                  <div className="font-semibold text-base">Seed Demo Data</div>
                  <div className="text-xs opacity-70">Load sample data</div>
                </div>
                <ArrowRight className="h-5 w-5 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statsDisplay.map((stat, index) => (
              <StatCard key={stat.label} {...stat} index={index} />
            ))}
          </div>

          {/* Recent Listings */}
          <Card className="p-6 md:p-8 border-border/50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent Listings</h2>
              <span className="text-muted-foreground text-sm">Use sidebar to browse all properties</span>
            </div>
            
            {recentListings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Home className="h-10 w-10" />
                </div>
                <p className="font-medium mb-1">No recent listings yet.</p>
                <p className="text-sm">
                  When new listings appear, they will be shown here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group relative overflow-hidden rounded-xl border border-border/50 bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Home className="h-16 w-16 text-muted-foreground relative z-10" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{listing.title}</h3>
                      <p className="text-success font-bold text-lg">{listing.price}</p>
                      <p className="text-muted-foreground text-sm flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {listing.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1 font-medium">{listing.rating}</span>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => incrementSavedProperties(1)}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Save Property
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Roommate Matches */}
          <Card className="p-6 md:p-8 border-border/50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Top Roommate Matches</h2>
              <span className="text-muted-foreground text-sm">Use sidebar to find all roommates</span>
            </div>
            
            {roommateMatches.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10" />
                </div>
                <p className="font-medium mb-1">No roommate matches made yet.</p>
                <p className="text-sm">
                  Complete your profile and preferences to get matches.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {roommateMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {match.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {match.name}, {match.age}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {match.occupation} • {match.budget}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {match.interests.slice(0, 3).map((interest, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex-1 sm:text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success font-bold">
                          <Sparkles className="h-4 w-4" />
                          {match.compatibility}% Match
                        </div>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300"
                        onClick={() => handleMessageClick(match)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return <DashboardContent />;
};

export default Dashboard;
