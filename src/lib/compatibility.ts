import type { RoommateRequestWithUser, CompatibilityScore } from '@/types/roommate';

export function calculateCompatibilityScore(
  request1: RoommateRequestWithUser,
  request2: RoommateRequestWithUser
): CompatibilityScore {
  const scores = {
    budget: calculateBudgetScore(request1.budget, request2.budget),
    location: calculateLocationScore(request1.location, request2.location),
    lifestyle: calculateLifestyleScore(request1.lifestyle, request2.lifestyle),
    preferences: calculatePreferencesScore(request1, request2),
    gender: 1, // Default value, implement proper calculation if needed
    habits: 1, // Default value, implement proper calculation if needed
    social: 1, // Default value, implement proper calculation if needed
    cleanliness: 1, // Default value, implement proper calculation if needed
  };

  const totalScore = (
    scores.budget * 0.3 +
    scores.location * 0.25 +
    scores.lifestyle * 0.25 +
    scores.preferences * 0.2
  );

  return {
    score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
    factors: scores,
  };
}

function calculateBudgetScore(budget1: number, budget2: number): number {
  const maxBudget = Math.max(budget1, budget2);
  const minBudget = Math.min(budget1, budget2);
  
  // If budgets are within 20% of each other, consider them highly compatible
  if (maxBudget <= minBudget * 1.2) {
    return 1;
  }
  
  // If budgets are within 50% of each other, partial compatibility
  if (maxBudget <= minBudget * 1.5) {
    return 0.7;
  }
  
  // Calculate score based on budget difference
  const difference = (maxBudget - minBudget) / maxBudget;
  return Math.max(0, 1 - difference);
}

function calculateLocationScore(location1: string, location2: string): number {
  // Exact match gets full score
  if (location1.toLowerCase() === location2.toLowerCase()) {
    return 1.0;
  }
  
  // Partial match (contains similar words) gets partial score
  const words1 = location1.toLowerCase().split(/\s+/);
  const words2 = location2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => 
    words2.some(w => w.includes(word) || word.includes(w))
  );
  
  if (commonWords.length > 0) {
    return 0.5;
  }
  
  return 0;
}

function calculateLifestyleScore(lifestyle1: string[], lifestyle2: string[]): number {
  if (!lifestyle1.length || !lifestyle2.length) {
    return 0.5; // Neutral score if no lifestyle preferences
  }
  
  const commonItems = lifestyle1.filter(item => lifestyle2.includes(item));
  const totalUniqueItems = new Set([...lifestyle1, ...lifestyle2]).size;
  
  // If they have common items, score based on overlap
  if (commonItems.length > 0) {
    return commonItems.length / Math.min(lifestyle1.length, lifestyle2.length);
  }
  
  // If no common items but compatible lifestyles, give partial score
  const compatiblePairs = [
    ['early_bird', 'studious'],
    ['night_owl', 'party_friendly'],
    ['social', 'party_friendly'],
    ['quiet', 'studious'],
    ['fitness_enthusiast', 'early_bird']
  ];
  
  for (const [style1, style2] of compatiblePairs) {
    if ((lifestyle1.includes(style1) && lifestyle2.includes(style2)) ||
        (lifestyle1.includes(style2) && lifestyle2.includes(style1))) {
      return 0.3;
    }
  }
  
  return commonItems.length / totalUniqueItems;
}

function calculatePreferencesScore(
  request1: RoommateRequestWithUser,
  request2: RoommateRequestWithUser
): number {
  let score = 0;
  let factors = 0;
  
  // Cleaning habits compatibility
  if (request1.cleaningHabits && request2.cleaningHabits) {
    score += getCleaningCompatibility(request1.cleaningHabits, request2.cleaningHabits);
    factors++;
  }
  
  // Smoking tolerance compatibility
  if (request1.smokingTolerance && request2.smokingTolerance) {
    score += getSmokingCompatibility(request1.smokingTolerance, request2.smokingTolerance);
    factors++;
  }
  
  // Pet preference compatibility
  if (request1.petPreference && request2.petPreference) {
    score += getPetCompatibility(request1.petPreference, request2.petPreference);
    factors++;
  }
  
  // Work schedule compatibility
  if (request1.workSchedule && request2.workSchedule) {
    score += getWorkScheduleCompatibility(request1.workSchedule, request2.workSchedule);
    factors++;
  }
  
  // Guest habits compatibility
  if (request1.guestHabits && request2.guestHabits) {
    score += getGuestHabitsCompatibility(request1.guestHabits, request2.guestHabits);
    factors++;
  }
  
  return factors > 0 ? score / factors : 0.5;
}

// Helper functions for specific compatibility calculations
function getCleaningCompatibility(habit1: string, habit2: string): number {
  if (habit1 === habit2) return 1;
  
  const cleaningLevels = ['messy', 'moderate', 'clean', 'very_clean'];
  const index1 = cleaningLevels.indexOf(habit1);
  const index2 = cleaningLevels.indexOf(habit2);
  
  if (index1 === -1 || index2 === -1) return 0.5;
  
  const difference = Math.abs(index1 - index2);
  return Math.max(0, 1 - (difference * 0.3));
}

function getSmokingCompatibility(tolerance1: string, tolerance2: string): number {
  if (tolerance1 === tolerance2) return 1;
  
  // Compatible combinations
  const compatiblePairs = [
    ['no_smoking', 'outdoor_only'],
    ['outdoor_only', 'smoking_ok']
  ];
  
  for (const [t1, t2] of compatiblePairs) {
    if ((tolerance1 === t1 && tolerance2 === t2) || 
        (tolerance1 === t2 && tolerance2 === t1)) {
      return 0.7;
    }
  }
  
  return 0;
}

function getPetCompatibility(pref1: string, pref2: string): number {
  if (pref1 === pref2) return 1;
  
  // Partial compatibility scenarios
  if (pref1 === 'pets_welcome' || pref2 === 'pets_welcome') {
    return 0.8;
  }
  
  if ((pref1 === 'cats_only' && pref2 === 'dogs_only') ||
      (pref1 === 'dogs_only' && pref2 === 'cats_only')) {
    return 0.3;
  }
  
  return 0;
}

function getWorkScheduleCompatibility(schedule1: string, schedule2: string): number {
  if (schedule1 === schedule2) return 1;
  
  // Compatible schedules
  const compatiblePairs = [
    ['day_shift', 'remote'],
    ['night_shift', 'remote'],
    ['flexible', 'remote'],
    ['flexible', 'day_shift'],
    ['flexible', 'night_shift']
  ];
  
  for (const [s1, s2] of compatiblePairs) {
    if ((schedule1 === s1 && schedule2 === s2) || 
        (schedule1 === s2 && schedule2 === s1)) {
      return 0.8;
    }
  }
  
  return 0.3;
}

function getGuestHabitsCompatibility(habit1: string, habit2: string): number {
  if (habit1 === habit2) return 1;
  
  const guestLevels = ['no_guests', 'occasional', 'frequent', 'very_frequent'];
  const index1 = guestLevels.indexOf(habit1);
  const index2 = guestLevels.indexOf(habit2);
  
  if (index1 === -1 || index2 === -1) return 0.5;
  
  const difference = Math.abs(index1 - index2);
  return Math.max(0, 1 - (difference * 0.25));
}

// Utility functions
export function getCompatibilityDescription(score: number): string {
  if (score >= 0.9) return 'Excellent Match';
  if (score >= 0.8) return 'Very Good Match';
  if (score >= 0.7) return 'Good Match';
  if (score >= 0.6) return 'Fair Match';
  if (score >= 0.5) return 'Poor Match';
  return 'Very Poor Match';
}

export function getMatchRecommendations(
  compatibilityScore: CompatibilityScore
): string[] {
  const recommendations: string[] = [];
  
  if (compatibilityScore.factors.budget < 0.7) {
    recommendations.push('Consider discussing budget expectations and splitting costs');
  }
  
  if (compatibilityScore.factors.location < 0.5) {
    recommendations.push('Location preferences may need compromise - discuss transportation options');
  }
  
  if (compatibilityScore.factors.lifestyle < 0.6) {
    recommendations.push('Discuss lifestyle differences and find common ground');
  }
  
  if (compatibilityScore.factors.preferences < 0.7) {
    recommendations.push('Review living preferences and establish clear house rules');
  }
  
  if (compatibilityScore.score >= 0.8) {
    recommendations.push('Great match! Consider scheduling a meet-up to discuss next steps');
  }
  
  return recommendations;
}

export function getCompatibilityColor(score: number): string {
  if (score >= 0.8) return '#10B981'; // Green
  if (score >= 0.6) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}