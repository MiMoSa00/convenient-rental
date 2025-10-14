// Updated comprehensive roommate types
export interface RoommateProfile {
  id: string;
  userId: string;
  
  // Basic Information
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  occupation: string;
  budget: {
    min: number;
    max: number;
  };
  
  // Housing Preferences
  preferredGender: 'male' | 'female' | 'any' | 'same-gender';
  location: string;
  moveInDate: string;
  leaseDuration: 'short-term' | 'long-term' | 'flexible';
  
  // Lifestyle
  sleepSchedule: 'early-bird' | 'night-owl' | 'flexible';
  socialLevel: 'very-social' | 'moderately-social' | 'prefer-quiet';
  cleanlinessLevel: 'very-clean' | 'moderately-clean' | 'relaxed';
  
  // Habits and Preferences
  smokingTolerance: 'no-smoking' | 'outdoor-only' | 'anywhere';
  drinkingHabits: 'non-drinker' | 'social-drinker' | 'regular-drinker';
  petPreference: 'love-pets' | 'okay-with-pets' | 'no-pets';
  
  // Work/Study Environment
  studyHabits: 'quiet-studier' | 'group-studier' | 'flexible';
  workFromHome: 'always' | 'sometimes' | 'never';
  
  // Social
  guestPolicy: 'frequent-guests' | 'occasional-guests' | 'rare-guests';
  sharedActivities: string[];
  
  // Deal Breakers
  dealBreakers: string[];
  
  // Profile status
  isComplete: boolean;
  status: RoommateStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy interface for backward compatibility
export interface RoommatePreferences {
  budget: number;
  moveInDate: Date;
  duration: number;
  lifestyle: string[];
  location: string;
  cleaningHabits: string;
  smokingTolerance: string;
  petPreference: string;
  workSchedule: string;
  guestHabits: string;
}

export interface RoommateRequestWithUser {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  budget: number;
  moveInDate: Date;
  duration: number;
  lifestyle: string[];
  location: string;
  cleaningHabits: string;
  smokingTolerance: string;
  petPreference: string;
  workSchedule: string;
  guestHabits: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced compatibility scoring
export interface CompatibilityScore {
  score: number;
  factors: {
    budget: number;
    location: number;
    lifestyle: number;
    preferences: number;
    gender: number;
    habits: number;
    social: number;
    cleanliness: number;
  };
}

// Enhanced roommate match with detailed compatibility
export interface RoommateMatch {
  id: string;
  requestOneId: number;
  requestTwoId: number;
  compatibilityScore: number;
  createdAt: Date;
  updatedAt: Date;
  // Optionally keep legacy/detailed fields for compatibility
  profileId1?: string;
  profileId2?: string;
  matchDetails?: {
    lifestyle: number;
    habits: number;
    preferences: number;
    budget: number;
    location: number;
    gender: number;
    social: number;
  };
  status?: 'pending' | 'liked' | 'matched' | 'rejected';
}

// Updated create request data to match new profile structure
export interface CreateRoommateRequestData {
  // Basic info
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  occupation?: string;
  budget: {
    min: number;
    max: number;
  };
  preferredGender?: 'male' | 'female' | 'any' | 'same-gender';
  location: string;
  moveInDate: string;
  leaseDuration?: 'short-term' | 'long-term' | 'flexible';
  duration?: number | string;
  lifestyle?: string[];
  cleaningHabits?: string;
  smokingTolerance?: string;
  petPreference?: string;
  workSchedule?: string;
  guestHabits?: string;
  sleepSchedule?: string;
  socialLevel?: string;
  cleanlinessLevel?: string;
  drinkingHabits?: string;
  studyHabits?: string;
  workFromHome?: string;
  guestPolicy?: string;
  sharedActivities?: string[];
  dealBreakers?: string[];
}

// Additional utility types
export interface RoommateMatchWithRequests extends RoommateMatch {
  requestOne: RoommateRequestWithUser;
  requestTwo: RoommateRequestWithUser;
}

export interface RoommateMatchWithProfiles {
  match: RoommateMatch;
  otherProfile: RoommateProfile;
  compatibility: CompatibilityScore;
}

export interface UserRoommateData {
  profile?: RoommateProfile;
  requests: RoommateRequestWithUser[];
  matches: RoommateMatchWithProfiles[];
  potentialMatches: RoommateMatchWithProfiles[];
}

// Status and option types
export type RoommateStatus = 'ACTIVE' | 'INACTIVE' | 'MATCHED' | 'EXPIRED' | 'PENDING';

// Enhanced lifestyle options
export type LifestyleOption =
  | 'early-bird'
  | 'night-owl'
  | 'very-social'
  | 'moderately-social'
  | 'prefer-quiet'
  | 'studious'
  | 'party-friendly'
  | 'fitness-enthusiast'
  | 'homebody'
  | 'work-from-home'
  | 'creative'
  | 'professional';

// Refined habit types to match quiz options
export type CleaningHabit = 'very-clean' | 'moderately-clean' | 'relaxed';
export type SmokingTolerance = 'no-smoking' | 'outdoor-only' | 'anywhere';
export type PetPreference = 'love-pets' | 'okay-with-pets' | 'no-pets';
export type WorkSchedule = 'always' | 'sometimes' | 'never'; // for work from home
export type GuestHabit = 'rare-guests' | 'occasional-guests' | 'frequent-guests';
export type SocialLevel = 'very-social' | 'moderately-social' | 'prefer-quiet';
export type SleepSchedule = 'early-bird' | 'night-owl' | 'flexible';
export type StudyHabits = 'quiet-studier' | 'group-studier' | 'flexible';
export type DrinkingHabits = 'non-drinker' | 'social-drinker' | 'regular-drinker';
export type LeaseDuration = 'short-term' | 'long-term' | 'flexible';
export type GenderPreference = 'male' | 'female' | 'any' | 'same-gender';

// Quiz-related types
export interface QuizStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'single-choice' | 'multiple-choice' | 'range' | 'text';
  options?: string[];
  required: boolean;
  field: keyof RoommateProfile;
}

// Matching algorithm types
export interface MatchingCriteria {
  maxDistance?: number; // for location matching
  minCompatibilityScore?: number;
  mustMatchGenderPreference?: boolean;
  mustMatchBudgetRange?: boolean;
  dealBreakerTolerance?: 'strict' | 'moderate' | 'flexible';
}

export interface MatchingResult {
  profile: RoommateProfile;
  compatibilityScore: number;
  matchDetails: CompatibilityScore['factors'];
  reasonsForMatch: string[];
  potentialConcerns: string[];
}

// API response types
export interface RoommateProfileResponse {
  success: boolean;
  profile?: RoommateProfile;
  error?: string;
}

export interface RoommateMatchesResponse {
  success: boolean;
  matches?: RoommateMatchWithProfiles[];
  totalMatches?: number;
  error?: string;
}

// Storage and state management types
export interface RoommateState {
  currentProfile?: RoommateProfile;
  matches: RoommateMatchWithProfiles[];
  potentialMatches: RoommateMatchWithProfiles[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
}

// Conversion utilities for backward compatibility
export const convertLegacyPreferences = (legacy: RoommatePreferences): Partial<RoommateProfile> => ({
  budget: {
    min: Math.max(0, legacy.budget - 200),
    max: legacy.budget + 200
  },
  moveInDate: legacy.moveInDate.toISOString(),
  location: legacy.location,
  cleanlinessLevel: legacy.cleaningHabits as CleaningHabit,
  smokingTolerance: legacy.smokingTolerance as SmokingTolerance,
  petPreference: legacy.petPreference as PetPreference,
  workFromHome: legacy.workSchedule as WorkSchedule,
  guestPolicy: legacy.guestHabits as GuestHabit,
  sharedActivities: legacy.lifestyle,
});

export const convertProfileToLegacy = (profile: RoommateProfile): RoommatePreferences => ({
  budget: (profile.budget.min + profile.budget.max) / 2,
  moveInDate: new Date(profile.moveInDate),
  duration: profile.leaseDuration === 'short-term' ? 6 : 12,
  lifestyle: profile.sharedActivities,
  location: profile.location,
  cleaningHabits: profile.cleanlinessLevel,
  smokingTolerance: profile.smokingTolerance,
  petPreference: profile.petPreference,
  workSchedule: profile.workFromHome,
  guestHabits: profile.guestPolicy,
});