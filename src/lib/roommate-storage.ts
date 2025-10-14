// lib/roommate-storage.ts
import { RoommateProfile, RoommateMatch } from '@/types/roommate';

const STORAGE_KEYS = {
  PROFILE: 'roommate_profile',
  MATCHES: 'roommate_matches',
  QUIZ_PROGRESS: 'quiz_progress'
} as const;

// Profile Storage
export const saveProfile = (profile: RoommateProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const getProfile = (): RoommateProfile | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!stored) return null;
    
    const profile = JSON.parse(stored);
    // Convert date strings back to Date objects
    profile.createdAt = new Date(profile.createdAt);
    profile.updatedAt = new Date(profile.updatedAt);
    
    return profile;
  } catch (error) {
    console.error('Error retrieving profile:', error);
    return null;
  }
};

export const clearProfile = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (error) {
    console.error('Error clearing profile:', error);
  }
};

// Matches Storage
export const saveMatches = (matches: RoommateMatch[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  } catch (error) {
    console.error('Error saving matches:', error);
  }
};

export const getMatches = (): RoommateMatch[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!stored) return [];
    
    const matches = JSON.parse(stored);
    // Convert date strings back to Date objects
    return matches.map((match: any) => ({
      ...match,
      createdAt: new Date(match.createdAt)
    }));
  } catch (error) {
    console.error('Error retrieving matches:', error);
    return [];
  }
};

export const addMatch = (match: RoommateMatch): void => {
  const matches = getMatches();
  matches.push(match);
  saveMatches(matches);
};

// Quiz Progress Storage
export const saveQuizProgress = (step: number, answers: Record<string, any>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify({ step, answers }));
  } catch (error) {
    console.error('Error saving quiz progress:', error);
  }
};

export const getQuizProgress = (): { step: number; answers: Record<string, any> } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error retrieving quiz progress:', error);
    return null;
  }
};

export const clearQuizProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_PROGRESS);
  } catch (error) {
    console.error('Error clearing quiz progress:', error);
  }
};

// API Integration Functions
export const saveProfileToAPI = async (profile: RoommateProfile): Promise<boolean> => {
  try {
    const response = await fetch('/api/roommate/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving profile to API:', error);
    return false;
  }
};

export const getProfileFromAPI = async (): Promise<RoommateProfile | null> => {
  try {
    const response = await fetch('/api/roommate/profile');
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile from API:', error);
    return null;
  }
};

export const getMatchesFromAPI = async (): Promise<RoommateMatch[]> => {
  try {
    const response = await fetch('/api/roommate/matches');
    if (!response.ok) return [];
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching matches from API:', error);
    return [];
  }
};