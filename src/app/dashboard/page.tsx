"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const userName = session?.user?.name || "Guest";

  // Stats with localStorage persistence and live counting
  const [stats, setStats] = useState({
    savedProperties: 0,
    roommateMatches: 0,
    messages: 0,
    profileViews: 0,
  });

  const [displayStats, setDisplayStats] = useState({
    savedProperties: 0,
    roommateMatches: 0,
    messages: 0,
    profileViews: 0,
  });

  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [roommateMatches, setRoommateMatches] = useState<RoommateMatch[]>([]);

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem("dashboardStats");
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats(parsed);
      setDisplayStats(parsed);
    } else {
      // Initialize with default values if no saved stats
      const initialStats = {
        savedProperties: 47,
        roommateMatches: 23,
        messages: 156,
        profileViews: 892,
      };
      setStats(initialStats);
      localStorage.setItem("dashboardStats", JSON.stringify(initialStats));
    }
  }, []);

  // Animated counting effect
  // Animated counting effect
  useEffect(() => {
    const duration = 1000; // 1 second for smoother animation
    const steps = 30;
    const stepDuration = duration / steps;

    // Store the starting values
    const startValues = { ...displayStats };
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Animate from current display value to target value
      setDisplayStats({
        savedProperties: Math.floor(
          startValues.savedProperties + (stats.savedProperties - startValues.savedProperties) * progress
        ),
        roommateMatches: Math.floor(
          startValues.roommateMatches + (stats.roommateMatches - startValues.roommateMatches) * progress
        ),
        messages: Math.floor(
          startValues.messages + (stats.messages - startValues.messages) * progress
        ),
        profileViews: Math.floor(
          startValues.profileViews + (stats.profileViews - startValues.profileViews) * progress
        ),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setDisplayStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dashboardStats", JSON.stringify(stats));
  }, [stats]);

  // Increment functions with live updates
  const incrementSavedProperties = () => {
    setStats((prev) => ({
      ...prev,
      savedProperties: prev.savedProperties + 1,
    }));
  };

  const incrementRoommateMatches = () => {
    setStats((prev) => ({
      ...prev,
      roommateMatches: prev.roommateMatches + 1,
    }));
  };

  const incrementMessages = () => {
    setStats((prev) => ({
      ...prev,
      messages: prev.messages + 1,
    }));
  };

  const incrementProfileViews = (amount: number = 1) => {
    setStats((prev) => ({
      ...prev,
      profileViews: prev.profileViews + amount,
    }));
  };

  // Handle message button click
  const handleMessageClick = (match: RoommateMatch) => {
    console.log("Message clicked for:", match.name);
    incrementMessages();
    // Here you would typically navigate to messages page
  };

  // Demo seed data
  const seedDemoData = () => {
    const demoListings: Listing[] = [
      {
        id: 1,
        title: "Cozy 2BR Apartment Near Campus",
        price: "₦800,000/month",
        location: "Lekki, Lagos",
        rating: 4.5,
        type: "apartment",
      },
      {
        id: 2,
        title: "Shared Room in Modern House",
        price: "₦450,000/month",
        location: "Gwarinpa, Abuja",
        rating: 4.2,
        type: "shared",
      },
      {
        id: 3,
        title: "Studio with Kitchen Access",
        price: "₦600,000/month",
        location: "Bodija, Ibadan",
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

  // Stats for display
  const statsDisplay = [
    {
      label: "Saved Properties",
      value: displayStats.savedProperties.toString(),
      icon: Heart,
      gradient: "from-destructive to-red-400",
      trend: displayStats.savedProperties > 0 ? `+${displayStats.savedProperties}` : undefined,
    },
    {
      label: "Roommate Matches",
      value: displayStats.roommateMatches.toString(),
      icon: Users,
      gradient: "from-primary to-primary-glow",
      trend: displayStats.roommateMatches > 0 ? `+${displayStats.roommateMatches}` : undefined,
    },
    {
      label: "Messages",
      value: displayStats.messages.toString(),
      icon: MessageSquare,
      gradient: "from-success to-green-400",
      trend: displayStats.messages > 0 ? `+${displayStats.messages}` : undefined,
    },
    {
      label: "Profile Views",
      value: displayStats.profileViews.toString(),
      icon: TrendingUp,
      gradient: "from-accent to-accent-glow",
      trend: displayStats.profileViews > 0 ? `+${displayStats.profileViews}` : undefined,
    },
  ];

  return (
    <div className="min-h-full w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary-light/5 to-accent-light/5">
        <div className="absolute inset-0 opacity-30" style={{ background: 'var(--gradient-mesh)' }} />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float hidden md:block" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float hidden md:block" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2 sm:space-y-3 md:space-y-4 animate-fade-in-down">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                <span className="truncate">Welcome back to RoomieFind</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto] break-words">
                Hello, {userName}! 👋
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Find your perfect space and ideal roommate with our intelligent matching system
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                className="h-auto py-3 sm:py-4 md:py-5 lg:py-6 px-3 sm:px-4 md:px-5 lg:px-6 flex flex-col items-start gap-1.5 sm:gap-2 md:gap-3 bg-gradient-to-br from-primary to-primary-glow hover:shadow-[var(--shadow-glow)] transition-all duration-500 group relative overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 relative z-10" />
                <div className="text-left relative z-10 w-full">
                  <div className="font-semibold text-xs sm:text-sm md:text-base">Browse Properties</div>
                  <div className="text-[10px] sm:text-xs opacity-90">Find your dream home</div>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="secondary" 
                className="h-auto py-3 sm:py-4 md:py-5 lg:py-6 px-3 sm:px-4 md:px-5 lg:px-6 flex flex-col items-start gap-1.5 sm:gap-2 md:gap-3 hover:bg-accent hover:text-accent-foreground transition-all duration-500 group"
                size="lg"
              >
                <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
                <div className="text-left w-full">
                  <div className="font-semibold text-xs sm:text-sm md:text-base">Find Roommates</div>
                  <div className="text-[10px] sm:text-xs opacity-70">Connect with matches</div>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-3 sm:py-4 md:py-5 lg:py-6 px-3 sm:px-4 md:px-5 lg:px-6 flex flex-col items-start gap-1.5 sm:gap-2 md:gap-3 hover:bg-card hover:border-primary transition-all duration-500 group sm:col-span-2 lg:col-span-1"
                size="lg"
                onClick={seedDemoData}
              >
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
                <div className="text-left w-full">
                  <div className="font-semibold text-xs sm:text-sm md:text-base">Seed Demo Data</div>
                  <div className="text-[10px] sm:text-xs opacity-70">Load sample data</div>
                </div>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {statsDisplay.map((stat, index) => (
              <StatCard key={stat.label} {...stat} index={index} />
            ))}
          </div>

          {/* Recent Listings */}
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8 border-border/50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">Recent Listings</h2>
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                Use sidebar to browse all properties
              </span>
            </div>
            
            {recentListings.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12 lg:py-16 text-muted-foreground">
                <div className="p-3 sm:p-4 rounded-full bg-muted/50 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Home className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
                </div>
                <p className="font-medium mb-1 text-xs sm:text-sm md:text-base">No recent listings yet.</p>
                <p className="text-[10px] sm:text-xs md:text-sm">
                  When new listings appear, they will be shown here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border/50 bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="h-32 sm:h-36 md:h-40 lg:h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Home className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 text-muted-foreground relative z-10" />
                    </div>
                    <div className="p-3 sm:p-4 md:p-5">
                      <h3 className="font-semibold mb-1.5 sm:mb-2 group-hover:text-primary transition-colors text-xs sm:text-sm md:text-base line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-success font-bold text-sm sm:text-base md:text-lg">{listing.price}</p>
                      <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm flex items-center mt-1.5 sm:mt-2">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{listing.location}</span>
                      </p>
                      <div className="flex items-center mt-1.5 sm:mt-2">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] sm:text-xs md:text-sm ml-1 font-medium">{listing.rating}</span>
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9"
                          onClick={incrementSavedProperties}
                        >
                          <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1.5 sm:mr-2" />
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
          <Card className="p-3 sm:p-4 md:p-6 lg:p-8 border-border/50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">Top Roommate Matches</h2>
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">
                Use sidebar to find all roommates
              </span>
            </div>
            
            {roommateMatches.length === 0 ? (
              <div className="text-center py-8 sm:py-10 md:py-12 lg:py-16 text-muted-foreground">
                <div className="p-3 sm:p-4 rounded-full bg-muted/50 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
                </div>
                <p className="font-medium mb-1 text-xs sm:text-sm md:text-base">No roommate matches made yet.</p>
                <p className="text-[10px] sm:text-xs md:text-sm">
                  Complete your profile and preferences to get matches.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                {roommateMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.id}
                    className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        {match.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base md:text-lg group-hover:text-primary transition-colors truncate">
                          {match.name}, {match.age}
                        </h3>
                        <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm break-words">
                          {match.occupation} • {match.budget}
                        </p>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mt-1.5 sm:mt-2">
                          {match.interests.slice(0, 3).map((interest, index) => (
                            <span
                              key={index}
                              className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-primary/20 whitespace-nowrap"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full bg-success/10 text-success font-bold text-[10px] sm:text-xs md:text-sm w-full sm:w-auto justify-center">
                          <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{match.compatibility}% Match</span>
                        </div>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all duration-300 w-full sm:w-auto text-[10px] sm:text-xs md:text-sm h-7 sm:h-8 md:h-9"
                        size="sm"
                        onClick={() => handleMessageClick(match)}
                      >
                        <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 mr-1.5 sm:mr-2" />
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