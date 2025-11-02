"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users, Heart, MessageSquare, Filter, Star, MapPin, Calendar, DollarSign, Building2, Sparkles } from "lucide-react";

// Import your custom types and utilities - KEEP THESE AS-IS
import { RoommateProfile, RoommateMatch, MatchingResult } from "@/types/roommate";
import { 
  getProfile, 
  saveProfile, 
  getMatches, 
  saveMatches, 
  clearProfile 
} from "@/lib/roommate-storage";
import { calculateCompatibility, generateMatches } from "@/lib/roommate-matching";
import CompatibilityQuiz from "@/components/roommate/CompatibiltyQuiz";
import ProgressBar from "@/components/ui/ProgressBar";

// Import messaging components - KEEP THESE AS-IS
import { MessageProvider, useMessages } from "@/context/MessageContext";
import ChatModal from "@/components/ChatModal";

// Enhanced match interface for display
interface DisplayMatch {
  id: string;
  name: string;
  age: number;
  occupation: string;
  budget: string;
  compatibility: number;
  interests: string[];
  profile: RoommateProfile;
}

// Scroll reveal component wrapper
const ScrollRevealCard = ({ children, index, ...props }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`bg-card border border-border rounded-lg p-4 sm:p-5 md:p-6 transition-all duration-700 hover:shadow-[var(--shadow-elegant)] transform hover:-translate-y-1 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      {...props}
    >
      {children}
    </div>
  );
};

const FindRoommatesContent = () => {
  const { openChat, chats } = useMessages();
  
  // State management
  const [currentProfile, setCurrentProfile] = useState<RoommateProfile | null>(null);
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    messages: 0,
    savedProfiles: 0,
  });

  // Calculate total messages from chats
  const totalMessages = chats.reduce((total, chat) => total + chat.unreadCount, 0);

  // Update stats when chats change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      messages: totalMessages
    }));
  }, [totalMessages]);

  // Filter states
  const [filters, setFilters] = useState({
    budgetRange: 'any',
    ageRange: 'any',
    occupation: 'any',
    compatibility: 'any',
  });

  // Load user profile and matches on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const profile = getProfile();
      setCurrentProfile(profile);

      if (profile) {
        await generateUserMatches(profile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUserMatches = async (userProfile: RoommateProfile) => {
    try {
      const demoProfiles = generateDemoProfiles();
      const roommateMatches = generateMatches(userProfile, demoProfiles);
      
      const displayMatches: DisplayMatch[] = roommateMatches.map(match => {
        const otherProfile = demoProfiles.find(p => p.id === match.profileId2);
        if (!otherProfile) return null;

        return {
          id: match.id,
          name: generateNameFromProfile(otherProfile),
          age: otherProfile.age,
          occupation: otherProfile.occupation,
          budget: `₦${otherProfile.budget.min.toLocaleString()}-${otherProfile.budget.max.toLocaleString()}`,
          compatibility: match.compatibilityScore,
          interests: generateInterestsFromProfile(otherProfile),
          profile: otherProfile
        };
      }).filter(Boolean) as DisplayMatch[];

      setMatches(displayMatches);
      setStats(prev => ({ ...prev, totalMatches: displayMatches.length }));
      saveMatches(roommateMatches);
    } catch (error) {
      console.error('Error generating matches:', error);
    }
  };

  const generateDemoProfiles = (): RoommateProfile[] => {
    const demoProfiles: RoommateProfile[] = [
      {
        id: 'demo_1',
        userId: 'user_1',
        age: 22,
        gender: 'female',
        occupation: 'Student',
        budget: { min: 200000, max: 350000 },
        preferredGender: 'any',
        location: 'Lekki, Lagos',
        moveInDate: '2024-02-01',
        leaseDuration: 'long-term',
        sleepSchedule: 'early-bird',
        socialLevel: 'moderately-social',
        cleanlinessLevel: 'very-clean',
        smokingTolerance: 'no-smoking',
        drinkingHabits: 'social-drinker',
        petPreference: 'okay-with-pets',
        studyHabits: 'quiet-studier',
        workFromHome: 'sometimes',
        guestPolicy: 'occasional-guests',
        sharedActivities: ['cooking-together', 'movie-nights', 'studying-together'],
        dealBreakers: ['smoking-indoors', 'loud-music-noise'],
        isComplete: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo_2',
        userId: 'user_2',
        age: 25,
        gender: 'male',
        occupation: 'Software Developer',
        budget: { min: 300000, max: 500000 },
        preferredGender: 'any',
        location: 'Gwarinpa, Abuja',
        moveInDate: '2024-01-15',
        leaseDuration: 'flexible',
        sleepSchedule: 'night-owl',
        socialLevel: 'very-social',
        cleanlinessLevel: 'moderately-clean',
        smokingTolerance: 'outdoor-only',
        drinkingHabits: 'social-drinker',
        petPreference: 'love-pets',
        studyHabits: 'flexible',
        workFromHome: 'always',
        guestPolicy: 'frequent-guests',
        sharedActivities: ['gaming', 'exercise-gym', 'cooking-together'],
        dealBreakers: ['messy-common-areas'],
        isComplete: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo_3',
        userId: 'user_3',
        age: 23,
        gender: 'female',
        occupation: 'Graphic Designer',
        budget: { min: 250000, max: 400000 },
        preferredGender: 'female',
        location: 'Bodija, Ibadan',
        moveInDate: '2024-03-01',
        leaseDuration: 'long-term',
        sleepSchedule: 'flexible',
        socialLevel: 'moderately-social',
        cleanlinessLevel: 'very-clean',
        smokingTolerance: 'no-smoking',
        drinkingHabits: 'non-drinker',
        petPreference: 'love-pets',
        studyHabits: 'quiet-studier',
        workFromHome: 'sometimes',
        guestPolicy: 'occasional-guests',
        sharedActivities: ['movie-nights', 'exercise-gym'],
        dealBreakers: ['smoking-indoors', 'too-many-guests'],
        isComplete: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo_4',
        userId: 'user_4',
        age: 26,
        gender: 'male',
        occupation: 'Teacher',
        budget: { min: 180000, max: 320000 },
        preferredGender: 'any',
        location: 'GRA, Port Harcourt',
        moveInDate: '2024-02-15',
        leaseDuration: 'long-term',
        sleepSchedule: 'early-bird',
        socialLevel: 'prefer-quiet',
        cleanlinessLevel: 'very-clean',
        smokingTolerance: 'no-smoking',
        drinkingHabits: 'non-drinker',
        petPreference: 'no-pets',
        studyHabits: 'quiet-studier',
        workFromHome: 'never',
        guestPolicy: 'rare-guests',
        sharedActivities: ['studying-together'],
        dealBreakers: ['loud-music-noise', 'pets', 'too-many-guests'],
        isComplete: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo_5',
        userId: 'user_5',
        age: 24,
        gender: 'female',
        occupation: 'Marketing Executive',
        budget: { min: 220000, max: 380000 },
        preferredGender: 'any',
        location: 'Wuse 2, Abuja',
        moveInDate: '2024-01-30',
        leaseDuration: 'flexible',
        sleepSchedule: 'night-owl',
        socialLevel: 'very-social',
        cleanlinessLevel: 'moderately-clean',
        smokingTolerance: 'outdoor-only',
        drinkingHabits: 'social-drinker',
        petPreference: 'love-pets',
        studyHabits: 'group-studier',
        workFromHome: 'always',
        guestPolicy: 'frequent-guests',
        sharedActivities: ['cooking-together', 'movie-nights', 'gaming'],
        dealBreakers: ['messy-common-areas'],
        isComplete: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return demoProfiles;
  };

  const generateNameFromProfile = (profile: RoommateProfile): string => {
    const names: Record<string, string> = {
      'demo_1': 'Sarah Johnson',
      'demo_2': 'Mike Chen',
      'demo_3': 'Emma Davis',
      'demo_4': 'Alex Rodriguez',
      'demo_5': 'Adaora Okafor'
    };
    return names[profile.id] || 'Anonymous User';
  };

  const generateInterestsFromProfile = (profile: RoommateProfile): string[] => {
    const interests = [];
    
    if (profile.cleanlinessLevel === 'very-clean') interests.push('Clean');
    if (profile.sleepSchedule === 'early-bird') interests.push('Early riser');
    if (profile.sleepSchedule === 'night-owl') interests.push('Night owl');
    if (profile.smokingTolerance === 'no-smoking') interests.push('Non-smoker');
    if (profile.petPreference === 'love-pets') interests.push('Pet lover');
    if (profile.workFromHome === 'always') interests.push('Remote work');
    if (profile.socialLevel === 'very-social') interests.push('Social');
    if (profile.studyHabits === 'quiet-studier') interests.push('Quiet');
    
    return interests.slice(0, 3);
  };

  const handleQuizComplete = (profile: RoommateProfile) => {
    setCurrentProfile(profile);
    saveProfile(profile);
    setShowQuiz(false);
    generateUserMatches(profile);
  };

  const handleQuizCancel = () => {
    setShowQuiz(false);
  };

  const handleMessageClick = (match: DisplayMatch) => {
    const roommateMatch = {
      id: match.profile.id,
      name: match.name,
      occupation: match.occupation,
      age: match.age
    };
    openChat(roommateMatch);
  };

  const handleSaveClick = (matchId: string) => {
    setStats(prev => ({ ...prev, savedProfiles: prev.savedProfiles + 1 }));
    console.log(`Saved match: ${matchId}`);
  };

  const handleCreateNewProfile = () => {
    setShowQuiz(true);
  };

  const handleRetakeQuiz = () => {
    clearProfile();
    setCurrentProfile(null);
    setMatches([]);
    setShowQuiz(true);
  };

  const filteredMatches = matches.filter(match => {
    if (filters.budgetRange !== 'any') {
      const budgetRanges: Record<string, { min: number; max: number }> = {
        '200000-350000': { min: 200000, max: 350000 },
        '350000-500000': { min: 350000, max: 500000 },
        '500000-700000': { min: 500000, max: 700000 },
        '700000+': { min: 700000, max: 9999999 }
      };
      const range = budgetRanges[filters.budgetRange];
      if (range && (match.profile.budget.max < range.min || match.profile.budget.min > range.max)) {
        return false;
      }
    }

    if (filters.ageRange !== 'any') {
      const ageRanges: Record<string, { min: number; max: number }> = {
        '18-22': { min: 18, max: 22 },
        '23-27': { min: 23, max: 27 },
        '28-32': { min: 28, max: 32 },
        '33+': { min: 33, max: 99 }
      };
      const range = ageRanges[filters.ageRange];
      if (range && (match.age < range.min || match.age > range.max)) {
        return false;
      }
    }

    if (filters.compatibility !== 'any') {
      const minCompatibility = parseInt(filters.compatibility.replace('%+', ''));
      if (match.compatibility < minCompatibility) {
        return false;
      }
    }

    return true;
  });

  if (showQuiz) {
    return (
      <CompatibilityQuiz 
        onComplete={handleQuizComplete}
        onCancel={handleQuizCancel}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading your roommate matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-full bg-gradient-to-b from-background to-muted/30">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden border-b border-border bg-card backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50"></div>
          
          <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3 animate-fade-in-down">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 backdrop-blur-sm rounded-full border border-primary/20 text-xs sm:text-sm text-primary">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse flex-shrink-0" />
                  <span className="whitespace-nowrap">AI-Powered Matching</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                  Find Your Perfect Roommate
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {currentProfile ? 'Your personalized matches based on compatibility' : 'Create your profile to get started with intelligent matching'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {currentProfile && (
                  <button 
                    className="bg-muted hover:bg-muted/80 text-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:shadow-lg whitespace-nowrap"
                    onClick={handleRetakeQuiz}
                  >
                    Retake Quiz
                  </button>
                )}
                <button 
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:shadow-lg whitespace-nowrap"
                  onClick={handleCreateNewProfile}
                >
                  {currentProfile ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status Section */}
        {currentProfile && (
          <div className="p-4 sm:p-6 md:p-8 lg:px-12 lg:py-6 border-b border-border bg-card backdrop-blur-sm animate-fade-in">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-lg p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0 text-base sm:text-lg">
                      {currentProfile.occupation[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground">Your Profile is Active</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground break-words">
                        <span className="inline-block">{currentProfile.age} years old</span>
                        <span className="mx-1">•</span>
                        <span className="inline-block">{currentProfile.occupation}</span>
                        <span className="mx-1">•</span>
                        <span className="inline-block">{currentProfile.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">Profile Completion</div>
                    <div className="flex items-center gap-2">
                      <ProgressBar current={100} total={100} className="w-16 sm:w-20" />
                      <span className="text-xs sm:text-sm font-medium text-success whitespace-nowrap">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Stats Section */}
        <div className="p-4 sm:p-6 md:p-8 lg:px-12 lg:py-6 border-b border-border bg-card backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 animate-fade-in-up">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-2 sm:p-3 md:p-5 lg:p-6 rounded-lg border border-primary/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-primary font-medium mb-0.5 md:mb-1 truncate">Total Matches</p>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground">{filteredMatches.length}</p>
                  </div>
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-primary flex-shrink-0 ml-1 sm:ml-2" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-success/10 to-success/5 p-2 sm:p-3 md:p-5 lg:p-6 rounded-lg border border-success/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-success font-medium mb-0.5 md:mb-1 truncate">Messages</p>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground">{stats.messages}</p>
                  </div>
                  <div className="relative flex-shrink-0 ml-1 sm:ml-2">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-success" />
                    {stats.messages > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-destructive text-destructive-foreground text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5 flex items-center justify-center animate-pulse font-medium">
                        {stats.messages > 9 ? '9+' : stats.messages}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-destructive/10 to-destructive/5 p-2 sm:p-3 md:p-5 lg:p-6 rounded-lg border border-destructive/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-destructive font-medium mb-0.5 md:mb-1 truncate">Saved Profiles</p>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground">{stats.savedProfiles}</p>
                  </div>
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-destructive flex-shrink-0 ml-1 sm:ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Profile CTA */}
        {!currentProfile && (
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 sm:p-8 text-primary-foreground text-center animate-scale-in">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 leading-tight">Get Started with Your Roommate Profile</h2>
                <p className="opacity-90 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                  Take our 5-minute compatibility quiz to find your perfect roommate matches
                </p>
                <button 
                  className="bg-card text-foreground hover:bg-muted px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl transform hover:scale-105"
                  onClick={handleCreateNewProfile}
                >
                  Take Compatibility Quiz
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Section */}
        {currentProfile && matches.length > 0 && (
          <div className="p-4 sm:p-6 md:p-8 lg:px-12 lg:py-6 border-b border-border bg-card backdrop-blur-sm">
            <div className="max-w-7xl mx-auto">
              <div className="bg-card rounded-lg border border-border p-4 sm:p-5 md:p-6 animate-fade-in">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-2 flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Filter Matches</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Budget Range
                    </label>
                    <select 
                      className="w-full border border-border bg-card text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={filters.budgetRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                    >
                      <option value="any">Any Budget</option>
                      <option value="200000-350000">₦200K-350K</option>
                      <option value="350000-500000">₦350K-500K</option>
                      <option value="500000-700000">₦500K-700K</option>
                      <option value="700000+">₦700K+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Age Range
                    </label>
                    <select 
                      className="w-full border border-border bg-card text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={filters.ageRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
                    >
                      <option value="any">Any Age</option>
                      <option value="18-22">18-22</option>
                      <option value="23-27">23-27</option>
                      <option value="28-32">28-32</option>
                      <option value="33+">33+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Occupation
                    </label>
                    <select 
                      className="w-full border border-border bg-card text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={filters.occupation}
                      onChange={(e) => setFilters(prev => ({ ...prev, occupation: e.target.value }))}
                    >
                      <option value="any">Any Occupation</option>
                      <option value="student">Student</option>
                      <option value="professional">Professional</option>
                      <option value="remote-worker">Remote Worker</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Compatibility
                    </label>
                    <select 
                      className="w-full border border-border bg-card text-foreground rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      value={filters.compatibility}
                      onChange={(e) => setFilters(prev => ({ ...prev, compatibility: e.target.value }))}
                    >
                      <option value="any">Any Match</option>
                      <option value="90%+">90%+ Match</option>
                      <option value="80%+">80%+ Match</option>
                      <option value="70%+">70%+ Match</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        <div className="p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground break-words">
                Your Matches {filteredMatches.length > 0 && `(${filteredMatches.length})`}
              </h2>
              {filteredMatches.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Found <span className="font-semibold text-primary">{filteredMatches.length}</span> compatible matches
                </p>
              )}
            </div>
            
            {!currentProfile ? (
              <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center animate-fade-in">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-foreground mb-2">Create your profile to see roommate matches</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Take our compatibility quiz to get personalized matches.
                </p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 sm:p-12 text-center animate-fade-in">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-foreground mb-2">No matches found with current filters</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Try adjusting your filters or retaking the quiz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredMatches.map((match, index) => (
                  <ScrollRevealCard key={match.id} index={index}>
                    <div className="flex flex-col gap-3 sm:gap-4">
                      {/* Header Section */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                            {match.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg text-foreground break-words">
                              {match.name}, {match.age}
                            </h3>
                            <p className="text-muted-foreground flex items-center text-xs sm:text-sm mt-1 break-words">
                              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{match.occupation}</span>
                            </p>
                            <p className="text-success font-semibold flex items-center text-xs sm:text-sm mt-1 break-words">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{match.budget}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center mb-1">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 mr-1 flex-shrink-0" />
                            <span className="text-xl sm:text-2xl font-bold text-success">
                              {match.compatibility}%
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Match</div>
                        </div>
                      </div>
                      
                      {/* Details Section */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground gap-2 sm:gap-3">
                          <div className="flex items-center min-w-0">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{match.profile.location}</span>
                          </div>
                          <div className="flex items-center flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="whitespace-nowrap">{match.profile.moveInDate}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {match.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-primary/20 whitespace-nowrap"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground py-2 sm:py-2.5 rounded-lg transition-all duration-300 font-medium text-xs sm:text-sm"
                          onClick={() => handleMessageClick(match)}
                        >
                          Message
                        </button>
                        <button
                          className="px-3 sm:px-4 py-2 sm:py-2.5 border border-border rounded-lg hover:bg-muted transition-all duration-300 hover:border-destructive group flex-shrink-0"
                          onClick={() => handleSaveClick(match.id)}
                        >
                          <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
                        </button>
                      </div>
                    </div>
                  </ScrollRevealCard>
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

export default function RoommatesPage() {
  return (
    <MessageProvider>
      <FindRoommatesContent />
    </MessageProvider>
  );
}