// lib/roommate-matching.ts
import { RoommateProfile, RoommateMatch } from '@/types/roommate';

// Nigerian cities and states for location matching
const NIGERIAN_LOCATIONS = {
  'Lagos': ['Victoria Island', 'Ikoyi', 'Lekki', 'Ikeja', 'Surulere', 'Yaba', 'Ajah', 'Magodo', 'Gbagada', 'Festac'],
  'Abuja': ['Wuse', 'Maitama', 'Asokoro', 'Garki', 'Gwarinpa', 'Kubwa', 'Nyanya', 'Karu', 'Lugbe', 'Jahi'],
  'Port Harcourt': ['GRA', 'Old GRA', 'D-Line', 'Rumuola', 'Eliozu', 'Rumuokwurushi', 'Trans Amadi', 'Mile 3'],
  'Kano': ['Fagge', 'Nasarawa', 'Gwale', 'Kumbotso', 'Ungogo', 'Dala', 'Tarauni', 'Municipal'],
  'Ibadan': ['Bodija', 'UI', 'Dugbe', 'Ring Road', 'Mokola', 'Agodi', 'Iyaganku', 'Oluyole'],
  'Kaduna': ['GRA', 'Barnawa', 'Malali', 'Sabon Tasha', 'Ungwan Rimi', 'Television', 'Narayi'],
  'Benin City': ['GRA', 'Ikpoba Hill', 'New Benin', 'Ring Road', 'Ugbowo', 'Upper Sakponba'],
  'Jos': ['Rayfield', 'Bukuru', 'Rantya', 'Lamingo', 'Jos North', 'Plateau'],
  'Warri': ['GRA', 'Effurun', 'Ekpan', 'PTI Road', 'NPA', 'Jeddo'],
  'Enugu': ['GRA', 'Independence Layout', 'New Haven', 'Trans Ekulu', 'Achara Layout', 'Coal Camp']
};

// Debug logging function
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Roommate Matching] ${message}`, data || '');
  }
};

export const calculateCompatibility = (profile1: RoommateProfile, profile2: RoommateProfile): number => {
  debugLog(`Calculating compatibility between ${profile1.id} and ${profile2.id}`);
  
  let weightedScore = 0;

  // Budget compatibility (Weight: 20%)
  const budgetScore = calculateBudgetCompatibility(profile1.budget, profile2.budget);
  weightedScore += budgetScore * 0.20;
  debugLog(`Budget score: ${budgetScore}`);

  // Location compatibility (Weight: 20%)
  const locationScore = calculateLocationCompatibility(profile1.location, profile2.location);
  weightedScore += locationScore * 0.20;
  debugLog(`Location score: ${locationScore}`);

  // Gender preference (Weight: 15%)
  const genderScore = calculateGenderCompatibility(
    profile1.gender, 
    profile1.preferredGender, 
    profile2.gender, 
    profile2.preferredGender
  );
  weightedScore += genderScore * 0.15;
  debugLog(`Gender score: ${genderScore}`);

  // Lifestyle compatibility (Weight: 15%)
  const lifestyleScore = calculateLifestyleCompatibility(profile1, profile2);
  weightedScore += lifestyleScore * 0.15;
  debugLog(`Lifestyle score: ${lifestyleScore}`);

  // Habits compatibility (Weight: 10%)
  const habitsScore = calculateHabitsCompatibility(profile1, profile2);
  weightedScore += habitsScore * 0.10;
  debugLog(`Habits score: ${habitsScore}`);

  // Cleanliness compatibility (Weight: 10%) - FIXED: Now included
  const cleanlinessScore = calculateCleanlinessCompatibility(profile1.cleanlinessLevel, profile2.cleanlinessLevel);
  weightedScore += cleanlinessScore * 0.10;
  debugLog(`Cleanliness score: ${cleanlinessScore}`);

  // Social compatibility (Weight: 10%)
  const socialScore = calculateSocialCompatibility(profile1, profile2);
  weightedScore += socialScore * 0.10;
  debugLog(`Social score: ${socialScore}`);

  const finalScore = Math.round(weightedScore);
  debugLog(`Final compatibility score: ${finalScore}`);
  
  return finalScore;
};

const calculateBudgetCompatibility = (
  budget1: { min: number; max: number }, 
  budget2: { min: number; max: number }
): number => {
  const overlap = Math.max(0, Math.min(budget1.max, budget2.max) - Math.max(budget1.min, budget2.min));
  const totalRange = Math.max(budget1.max, budget2.max) - Math.min(budget1.min, budget2.min);
  
  if (totalRange === 0) return 100;
  return (overlap / totalRange) * 100;
};

// Enhanced location compatibility for Nigerian cities
const calculateLocationCompatibility = (location1: string, location2: string): number => {
  if (!location1 || !location2) return 0;
  
  const loc1 = location1.toLowerCase().trim();
  const loc2 = location2.toLowerCase().trim();
  
  // Exact match
  if (loc1 === loc2) return 100;
  
  // Check if both locations are in the same state/city
  for (const [state, areas] of Object.entries(NIGERIAN_LOCATIONS)) {
    const stateLower = state.toLowerCase();
    const areasLower = areas.map(area => area.toLowerCase());
    
    const loc1InState = loc1.includes(stateLower) || areasLower.some(area => loc1.includes(area));
    const loc2InState = loc2.includes(stateLower) || areasLower.some(area => loc2.includes(area));
    
    if (loc1InState && loc2InState) {
      // Same state/city, different areas
      return 85;
    }
  }
  
  // Check for neighboring states or major cities
  const neighboringRegions = {
    'lagos': ['ogun', 'oyo'],
    'abuja': ['niger', 'kaduna', 'kogi', 'nasarawa'],
    'kano': ['kaduna', 'jigawa', 'katsina'],
    'ibadan': ['lagos', 'ogun', 'osun'],
    'port harcourt': ['rivers', 'bayelsa', 'akwa ibom'],
  };
  
  for (const [region, neighbors] of Object.entries(neighboringRegions)) {
    if (loc1.includes(region) && neighbors.some(neighbor => loc2.includes(neighbor))) {
      return 60;
    }
    if (loc2.includes(region) && neighbors.some(neighbor => loc1.includes(neighbor))) {
      return 60;
    }
  }
  
  // Different regions but same geopolitical zone
  const geopoliticalZones = {
    'south-west': ['lagos', 'ogun', 'oyo', 'osun', 'ondo', 'ekiti'],
    'north-central': ['abuja', 'niger', 'kogi', 'kwara', 'nasarawa', 'plateau', 'benue'],
    'north-west': ['kaduna', 'kano', 'katsina', 'kebbi', 'sokoto', 'zamfara', 'jigawa'],
    'north-east': ['borno', 'yobe', 'bauchi', 'gombe', 'adamawa', 'taraba'],
    'south-east': ['enugu', 'anambra', 'imo', 'abia', 'ebonyi'],
    'south-south': ['rivers', 'bayelsa', 'akwa ibom', 'cross river', 'delta', 'edo']
  };
  
  for (const states of Object.values(geopoliticalZones)) {
    const loc1InZone = states.some(state => loc1.includes(state));
    const loc2InZone = states.some(state => loc2.includes(state));
    
    if (loc1InZone && loc2InZone) {
      return 40;
    }
  }
  
  // Different zones
  return 20;
};

const calculateGenderCompatibility = (
  gender1: string, 
  preference1: string, 
  gender2: string, 
  preference2: string
): number => {
  // Check if both people's gender preferences are satisfied
  const person1Satisfied = preference1 === 'any' || 
                          preference1 === gender2 || 
                          (preference1 === 'same-gender' && gender1 === gender2);
  
  const person2Satisfied = preference2 === 'any' || 
                          preference2 === gender1 || 
                          (preference2 === 'same-gender' && gender1 === gender2);

  if (person1Satisfied && person2Satisfied) return 100;
  if (person1Satisfied || person2Satisfied) return 50;
  return 0;
};

const calculateLifestyleCompatibility = (profile1: RoommateProfile, profile2: RoommateProfile): number => {
  let score = 0;
  let factors = 0;

  // Sleep schedule compatibility
  if (profile1.sleepSchedule === profile2.sleepSchedule || 
      profile1.sleepSchedule === 'flexible' || 
      profile2.sleepSchedule === 'flexible') {
    score += 100;
  } else {
    score += 30; // Some incompatibility but not a deal breaker
  }
  factors++;

  // Work from home compatibility
  if (profile1.workFromHome === profile2.workFromHome) {
    score += 100;
  } else if (profile1.workFromHome === 'sometimes' || profile2.workFromHome === 'sometimes') {
    score += 70;
  } else {
    score += 40;
  }
  factors++;

  // Study habits compatibility
  if (profile1.studyHabits === profile2.studyHabits || 
      profile1.studyHabits === 'flexible' || 
      profile2.studyHabits === 'flexible') {
    score += 100;
  } else {
    score += 50;
  }
  factors++;

  return score / factors;
};

const calculateHabitsCompatibility = (profile1: RoommateProfile, profile2: RoommateProfile): number => {
  let score = 0;
  let factors = 0;

  // Smoking tolerance
  const smokingCompatible = checkSmokingCompatibility(profile1.smokingTolerance, profile2.smokingTolerance);
  score += smokingCompatible ? 100 : 0;
  factors++;

  // Pet preference
  const petCompatible = checkPetCompatibility(profile1.petPreference, profile2.petPreference);
  score += petCompatible ? 100 : 20; // Some tolerance for pets
  factors++;

  // Drinking habits
  if (profile1.drinkingHabits === profile2.drinkingHabits) {
    score += 100;
  } else if ((profile1.drinkingHabits === 'social-drinker' || profile2.drinkingHabits === 'social-drinker')) {
    score += 70; // Social drinkers are generally flexible
  } else {
    score += 40;
  }
  factors++;

  return score / factors;
};

const calculateCleanlinessCompatibility = (cleanliness1: string, cleanliness2: string): number => {
  if (cleanliness1 === cleanliness2) return 100;
  
  const cleanlinessLevels = { 'relaxed': 1, 'moderately-clean': 2, 'very-clean': 3 };
  const diff = Math.abs(cleanlinessLevels[cleanliness1 as keyof typeof cleanlinessLevels] - 
                       cleanlinessLevels[cleanliness2 as keyof typeof cleanlinessLevels]);
  
  return Math.max(0, 100 - (diff * 40));
};

const calculateSocialCompatibility = (profile1: RoommateProfile, profile2: RoommateProfile): number => {
  let score = 0;
  let factors = 0;

  // Social level compatibility
  if (profile1.socialLevel === profile2.socialLevel) {
    score += 100;
  } else {
    score += 60; // Different social levels can work
  }
  factors++;

  // Guest policy compatibility
  if (profile1.guestPolicy === profile2.guestPolicy) {
    score += 100;
  } else {
    const guestLevels = { 'rare-guests': 1, 'occasional-guests': 2, 'frequent-guests': 3 };
    const diff = Math.abs(guestLevels[profile1.guestPolicy as keyof typeof guestLevels] - 
                         guestLevels[profile2.guestPolicy as keyof typeof guestLevels]);
    score += Math.max(30, 100 - (diff * 35));
  }
  factors++;

  return score / factors;
};

const checkSmokingCompatibility = (tolerance1: string, tolerance2: string): boolean => {
  if (tolerance1 === 'no-smoking' && tolerance2 !== 'no-smoking') return false;
  if (tolerance2 === 'no-smoking' && tolerance1 !== 'no-smoking') return false;
  return true;
};

const checkPetCompatibility = (preference1: string, preference2: string): boolean => {
  if (preference1 === 'no-pets' && preference2 !== 'no-pets') return false;
  if (preference2 === 'no-pets' && preference1 !== 'no-pets') return false;
  return true;
};

// Generate Nigerian demo profiles for testing
export const generateNigerianDemoProfiles = (): RoommateProfile[] => {
  const demoProfiles: RoommateProfile[] = [
    {
      id: 'ng_demo_1',
      userId: 'user_ng_1',
      age: 24,
      gender: 'female',
      occupation: 'Software Developer',
      budget: { min: 200000, max: 350000 },
      preferredGender: 'any',
      location: 'Lekki, Lagos',
      moveInDate: '2024-02-01',
      leaseDuration: 'long-term',
      sleepSchedule: 'night-owl',
      socialLevel: 'moderately-social',
      cleanlinessLevel: 'very-clean',
      smokingTolerance: 'no-smoking',
      drinkingHabits: 'social-drinker',
      petPreference: 'okay-with-pets',
      studyHabits: 'flexible',
      workFromHome: 'always',
      guestPolicy: 'occasional-guests',
      sharedActivities: ['cooking-together', 'movie-nights', 'exercise-gym'],
      dealBreakers: ['smoking-indoors', 'loud-music-noise'],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ng_demo_2',
      userId: 'user_ng_2',
      age: 22,
      gender: 'male',
      occupation: 'University Student',
      budget: { min: 120000, max: 200000 },
      preferredGender: 'male',
      location: 'Gwarinpa, Abuja',
      moveInDate: '2024-01-15',
      leaseDuration: 'short-term',
      sleepSchedule: 'early-bird',
      socialLevel: 'very-social',
      cleanlinessLevel: 'moderately-clean',
      smokingTolerance: 'no-smoking',
      drinkingHabits: 'non-drinker',
      petPreference: 'no-pets',
      studyHabits: 'quiet-studier',
      workFromHome: 'never',
      guestPolicy: 'frequent-guests',
      sharedActivities: ['studying-together', 'gaming', 'movie-nights'],
      dealBreakers: ['smoking-indoors', 'pets'],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ng_demo_3',
      userId: 'user_ng_3',
      age: 26,
      gender: 'female',
      occupation: 'Marketing Executive',
      budget: { min: 180000, max: 300000 },
      preferredGender: 'female',
      location: 'Victoria Island, Lagos',
      moveInDate: '2024-03-01',
      leaseDuration: 'long-term',
      sleepSchedule: 'flexible',
      socialLevel: 'moderately-social',
      cleanlinessLevel: 'very-clean',
      smokingTolerance: 'no-smoking',
      drinkingHabits: 'social-drinker',
      petPreference: 'love-pets',
      studyHabits: 'flexible',
      workFromHome: 'sometimes',
      guestPolicy: 'occasional-guests',
      sharedActivities: ['cooking-together', 'exercise-gym'],
      dealBreakers: ['smoking-indoors', 'messy-common-areas'],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ng_demo_4',
      userId: 'user_ng_4',
      age: 28,
      gender: 'male',
      occupation: 'Bank Officer',
      budget: { min: 250000, max: 400000 },
      preferredGender: 'any',
      location: 'Wuse 2, Abuja',
      moveInDate: '2024-02-15',
      leaseDuration: 'long-term',
      sleepSchedule: 'early-bird',
      socialLevel: 'prefer-quiet',
      cleanlinessLevel: 'very-clean',
      smokingTolerance: 'no-smoking',
      drinkingHabits: 'social-drinker',
      petPreference: 'okay-with-pets',
      studyHabits: 'quiet-studier',
      workFromHome: 'never',
      guestPolicy: 'rare-guests',
      sharedActivities: ['none-keep-separate-lives'],
      dealBreakers: ['loud-music-noise', 'too-many-guests'],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ng_demo_5',
      userId: 'user_ng_5',
      age: 23,
      gender: 'female',
      occupation: 'Graphic Designer',
      budget: { min: 150000, max: 250000 },
      preferredGender: 'any',
      location: 'Bodija, Ibadan',
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
    },
    {
      id: 'ng_demo_6',
      userId: 'user_ng_6',
      age: 25,
      gender: 'male',
      occupation: 'Civil Engineer',
      budget: { min: 200000, max: 350000 },
      preferredGender: 'male',
      location: 'GRA, Port Harcourt',
      moveInDate: '2024-02-20',
      leaseDuration: 'long-term',
      sleepSchedule: 'early-bird',
      socialLevel: 'moderately-social',
      cleanlinessLevel: 'very-clean',
      smokingTolerance: 'no-smoking',
      drinkingHabits: 'non-drinker',
      petPreference: 'no-pets',
      studyHabits: 'quiet-studier',
      workFromHome: 'sometimes',
      guestPolicy: 'occasional-guests',
      sharedActivities: ['exercise-gym', 'studying-together'],
      dealBreakers: ['smoking-indoors', 'pets', 'loud-music-noise'],
      isComplete: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return demoProfiles;
};

// IMPROVED: Lower threshold and better debugging
export const generateMatches = (userProfile: RoommateProfile, allProfiles: RoommateProfile[]): RoommateMatch[] => {
  debugLog(`Generating matches for user ${userProfile.id}`);
  debugLog(`Total profiles to check: ${allProfiles.length}`);
  
  const matches: RoommateMatch[] = [];
  
  for (const otherProfile of allProfiles) {
    if (otherProfile.id === userProfile.id) continue;
    
    const compatibilityScore = calculateCompatibility(userProfile, otherProfile);
    
    // FIXED: Lowered threshold from 65% to 45% for more matches
    if (compatibilityScore >= 45) {
      const lifestyleScore = calculateLifestyleCompatibility(userProfile, otherProfile);
      const habitsScore = calculateHabitsCompatibility(userProfile, otherProfile);
      const genderScore = calculateGenderCompatibility(
        userProfile.gender, 
        userProfile.preferredGender, 
        otherProfile.gender, 
        otherProfile.preferredGender
      );
      const budgetScore = calculateBudgetCompatibility(userProfile.budget, otherProfile.budget);
      const locationScore = calculateLocationCompatibility(userProfile.location, otherProfile.location);
      const cleanlinessScore = calculateCleanlinessCompatibility(userProfile.cleanlinessLevel, otherProfile.cleanlinessLevel);
      const socialScore = calculateSocialCompatibility(userProfile, otherProfile);

      const match: RoommateMatch = {
        id: `${userProfile.id}-${otherProfile.id}`,
        // Request IDs are not available in this matching context; use 0 as a placeholder.
        // These are required by the RoommateMatch type. Callers that persist matches should
        // replace these with real request IDs when creating records in the database.
        requestOneId: 0,
        requestTwoId: 0,
        profileId1: userProfile.id,
        profileId2: otherProfile.id,
        compatibilityScore,
        matchDetails: {
          lifestyle: Math.round(lifestyleScore),
          habits: Math.round(habitsScore),
          preferences: Math.round(genderScore), // FIXED: Now properly labeled
          budget: Math.round(budgetScore),
          location: Math.round(locationScore),
          gender: Math.round(cleanlinessScore), // FIXED: Now shows cleanliness instead of duplicate gender
          social: Math.round(socialScore)
        },
        status: 'pending',
        createdAt: new Date(),
        // Provide updatedAt to satisfy the type; will be equal to createdAt here.
        updatedAt: new Date()
      };
      
      matches.push(match);
      debugLog(`Added match with ${otherProfile.id}, score: ${compatibilityScore}`);
    } else {
      debugLog(`Rejected match with ${otherProfile.id}, score too low: ${compatibilityScore}`);
    }
  }
  
  debugLog(`Total matches found: ${matches.length}`);
  
  // Sort by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

// ADDED: Debug function to test matching with demo profiles
export const debugMatching = (userProfile: RoommateProfile) => {
  const demoProfiles = generateNigerianDemoProfiles();
  const allProfiles = [...demoProfiles, userProfile];
  
  debugLog('=== DEBUGGING ROOMMATE MATCHING ===');
  debugLog('User profile:', userProfile);
  debugLog('Demo profiles count:', demoProfiles.length);
  
  const matches = generateMatches(userProfile, allProfiles);
  
  debugLog('=== MATCH RESULTS ===');
  debugLog('Total matches found:', matches.length);
  
  matches.forEach((match, index) => {
    const otherProfile = demoProfiles.find(p => p.id === match.profileId2);
    debugLog(`Match ${index + 1}:`, {
      otherProfileId: match.profileId2,
      otherProfileName: otherProfile?.occupation,
      compatibilityScore: match.compatibilityScore,
      matchDetails: match.matchDetails
    });
  });
  
  return matches;
};

// Helper function to get location suggestions for Nigerian users
export const getNigerianLocationSuggestions = (query: string): string[] => {
  const suggestions: string[] = [];
  const queryLower = query.toLowerCase();
  
  for (const [state, areas] of Object.entries(NIGERIAN_LOCATIONS)) {
    // Add state if it matches
    if (state.toLowerCase().includes(queryLower)) {
      suggestions.push(state);
    }
    
    // Add areas that match
    for (const area of areas) {
      if (area.toLowerCase().includes(queryLower)) {
        suggestions.push(`${area}, ${state}`);
      }
    }
  }
  
  return suggestions.slice(0, 10); // Limit to 10 suggestions
};