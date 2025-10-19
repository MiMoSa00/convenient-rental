"use client";

import React, { useState, useEffect } from "react";
import { Users, Heart, MessageSquare, Filter, Star, MapPin, Calendar, DollarSign, Briefcase } from "lucide-react";

// Import our custom types and utilities
import { RoommateProfile, RoommateMatch, MatchingResult } from "@/types/roommate";
import { 
  getProfile, 
  saveProfile, 
  getMatches, 
  saveMatches, 
  clearProfile 
} from "@/lib/roommate-storage";
import { calculateCompatibility, generateMatches } from "@/lib/roommate-matching";
// import CompatibilityQuiz from "@/components/roommate/CompatibilityQuiz";
import CompatibilityQuiz from "@/components/roommate/CompatibiltyQuiz";
import ProgressBar from "@/components/ui/ProgressBar";

// Import messaging components
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
      // Load user profile from localStorage
      const profile = getProfile();
      setCurrentProfile(profile);

      // If profile exists, generate matches
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
      // Generate demo profiles for matching (in real app, this would come from API)
      const demoProfiles = generateDemoProfiles();
      
      // Generate matches using our matching algorithm
      const roommateMatches = generateMatches(userProfile, demoProfiles);
      
      // Convert to display format
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
      
      // Save matches to storage
      saveMatches(roommateMatches);
    } catch (error) {
      console.error('Error generating matches:', error);
    }
  };

  // Generate demo profiles for matching
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

  // Helper functions
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

  // Event handlers
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

  // Filter matches based on current filters
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

  // Show quiz if no profile exists or user wants to retake
  if (showQuiz) {
    return (
      <CompatibilityQuiz 
        onComplete={handleQuizComplete}
        onCancel={handleQuizCancel}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your roommate matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Find Roommates</h1>
            <p className="text-gray-600 mt-1">
              {currentProfile ? 'Your personalized matches' : 'Create your profile to get started'}
            </p>
          </div>
          <div className="flex gap-3">
            {currentProfile && (
              <button 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                onClick={handleRetakeQuiz}
              >
                Retake Quiz
              </button>
            )}
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
              onClick={handleCreateNewProfile}
            >
              {currentProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </div>

        {/* Profile Status */}
        {currentProfile && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentProfile.occupation[0]}
                </div>
                <div>
                  <h3 className="font-semibold">Your Profile is Active</h3>
                  <p className="text-sm text-gray-600">
                    {currentProfile.age} years old • {currentProfile.occupation} • {currentProfile.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Profile Completion</div>
                <div className="flex items-center space-x-2">
                  <ProgressBar current={100} total={100} className="w-20" />
                  <span className="text-sm font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Matches</p>
                <p className="text-2xl font-bold">{filteredMatches.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
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
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Profiles</p>
                <p className="text-2xl font-bold">{stats.savedProfiles}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* No Profile CTA */}
        {!currentProfile && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Get Started with Your Roommate Profile</h2>
            <p className="opacity-90 mb-6">
              Take our 5-minute compatibility quiz to find your perfect roommate matches
            </p>
            <button 
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors font-semibold"
              onClick={handleCreateNewProfile}
            >
              Take Compatibility Quiz
            </button>
          </div>
        )}

        {/* Filters */}
        {currentProfile && matches.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold">Filter Matches</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compatibility
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
        )}

        {/* Matches */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Your Matches {filteredMatches.length > 0 && `(${filteredMatches.length})`}
            </h2>
          </div>
          <div className="p-6">
            {!currentProfile ? (
              <div className="text-center py-10 text-gray-600">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>Create your profile to see roommate matches</p>
                <p className="text-sm text-gray-500 mt-2">
                  Take our compatibility quiz to get personalized matches.
                </p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p>No matches found with current filters</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your filters or retaking the quiz.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((match) => (
                  <div
                    key={match.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {match.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {match.name}, {match.age}
                          </h3>
                          <p className="text-gray-600 flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {match.occupation}
                          </p>
                          <p className="text-green-600 font-semibold flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {match.budget}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-2xl font-bold text-green-600">
                            {match.compatibility}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">Match</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {match.profile.location}
                        <Calendar className="h-4 w-4 ml-3 mr-1" />
                        {match.profile.moveInDate}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {match.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                        onClick={() => handleMessageClick(match)}
                      >
                        Message
                      </button>
                      <button
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => handleSaveClick(match.id)}
                      >
                        <Heart className="h-5 w-5 text-gray-400" />
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

export default function RoommatesPage() {
  return (
    <MessageProvider>
      <FindRoommatesContent />
    </MessageProvider>
  );
}