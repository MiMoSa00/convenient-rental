import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth.config";

// Define types matching your Prisma schema
interface RoommatePreferences {
  cleanliness?: number;
  socialLevel?: number;
  smoking?: boolean;
  pets?: boolean;
  gender?: "male" | "female" | "no_preference";
  ageRange?: [number, number];
  workSchedule?: "day" | "night" | "flexible";
  maxBudget?: number;
}

interface UserMatchData {
  preferences: RoommatePreferences;
  interests: string[];
}

interface PropertyResult {
  id: number;
  title: string;
  type: string;
  price: number;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  beds: number;
  baths: number;
  description: string;
  amenities: string[];
  availableFrom: Date;
  createdAt: Date;
  updatedAt: Date;
  isAvailable: boolean;
  distance: number;
}

interface RoommateResult {
  id: number;
  name: string;
  age: number;
  occupation: string;
  profileImage: string | null;
  distance: number;
  matchPercentage: number;
  interests: string[];
  preferences: RoommatePreferences;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radius = parseFloat(searchParams.get("radius") || "5");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");
    const filter = (searchParams.get("filter") as "all" | "properties" | "roommates") || "all";

    // Validate input parameters
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid location coordinates provided" },
        { status: 400 }
      );
    }
    
    if (isNaN(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "Invalid radius provided" },
        { status: 400 }
      );
    }
    
    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < minPrice) {
      return NextResponse.json(
        { error: "Invalid price range provided" },
        { status: 400 }
      );
    }

    // Get user session to exclude current user from roommate results
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id.toString()) : undefined;

    // Calculate bounding box for faster querying
    const milesPerLat = 69; // Approximate miles per degree latitude
    const milesPerLng = 69 * Math.cos(lat * (Math.PI / 180));
    const latRadius = radius / milesPerLat;
    const lngRadius = radius / milesPerLng;

    const minLat = lat - latRadius;
    const maxLat = lat + latRadius;
    const minLng = lng - lngRadius;
    const maxLng = lng + lngRadius;

    // Fetch properties within radius and price range
    let properties: PropertyResult[] = [];
    if (filter === "all" || filter === "properties") {
      const rawProperties = await prisma.property.findMany({
        where: {
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLng,
            lte: maxLng,
          },
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
          isAvailable: true,
        },
        select: {
          id: true,
          title: true,
          type: true,
          price: true,
          address: true,
          latitude: true,
          longitude: true,
          images: true,
          beds: true,
          baths: true,
          description: true,
          amenities: true,
          availableFrom: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Calculate exact distances and filter by actual radius
      properties = rawProperties
        .map((p): PropertyResult => ({
          ...p,
          isAvailable: true,
          distance: calculateDistance(lat, lng, p.latitude, p.longitude),
        }))
        .filter((p) => p.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    // Fetch potential roommates within radius
    let roommates: RoommateResult[] = [];
    if (filter === "all" || filter === "roommates") {
      const rawRoommates = await prisma.user.findMany({
        where: {
          ...(userId && { id: { not: userId } }),
          latitude: {
            gte: minLat,
            lte: maxLat,
          },
          longitude: {
            gte: minLng,
            lte: maxLng,
          },
          lookingForRoommate: true,
        },
        select: {
          id: true,
          name: true,
          age: true,
          occupation: true,
          profileImage: true,
          latitude: true,
          longitude: true,
          interests: true,
          preferences: true,
        },
      });

      // Get current user's preferences for matching (if logged in)
      let currentUserData: UserMatchData | null = null;
      if (userId) {
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            preferences: true,
            interests: true,
          },
        });

        if (currentUser) {
          currentUserData = {
            preferences: (currentUser.preferences as RoommatePreferences) || {},
            interests: currentUser.interests || [],
          };
        }
      }

      // Calculate distances and match percentages
      roommates = rawRoommates
        .map((r): RoommateResult | null => {
          // Check if latitude and longitude exist
          if (r.latitude === null || r.longitude === null) {
            return null;
          }

          const distance = calculateDistance(lat, lng, r.latitude, r.longitude);
          
          // Calculate match percentage only if user is logged in
          const matchPercentage = currentUserData
            ? calculateMatchPercentage(
                currentUserData,
                {
                  preferences: (r.preferences as RoommatePreferences) || {},
                  interests: r.interests || [],
                }
              )
            : 0;

          return {
            id: r.id,
            name: r.name,
            age: r.age ?? 0,
            occupation: r.occupation ?? "Not specified",
            profileImage: r.profileImage,
            distance,
            matchPercentage,
            interests: r.interests || [],
            preferences: (r.preferences as RoommatePreferences) || {},
          };
        })
        .filter((r): r is RoommateResult => r !== null && r.distance <= radius)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json({ properties, roommates });
  } catch (error) {
    console.error("Error fetching nearby items:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching nearby items" },
      { status: 500 }
    );
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate match percentage between users based on their preferences and interests
 */
function calculateMatchPercentage(
  user1: UserMatchData,
  user2: UserMatchData
): number {
  // Calculate match based on preferences and interests
  const preferencesMatch = comparePreferences(user1.preferences, user2.preferences);
  const interestsMatch = compareInterests(user1.interests, user2.interests);

  // Weight preferences more heavily than interests (70% preferences, 30% interests)
  const matchPercentage = Math.round((preferencesMatch * 0.7 + interestsMatch * 0.3) * 100);

  // Ensure the percentage is between 0 and 100
  return Math.max(0, Math.min(100, matchPercentage));
}

/**
 * Compare two users' preferences and return a similarity score between 0 and 1
 */
function comparePreferences(
  prefs1: RoommatePreferences,
  prefs2: RoommatePreferences
): number {
  if (!prefs1 || !prefs2) return 0;

  let matchPoints = 0;
  let totalPoints = 0;

  // Compare smoking preferences
  if (prefs1.smoking !== undefined && prefs2.smoking !== undefined) {
    matchPoints += prefs1.smoking === prefs2.smoking ? 1 : 0;
    totalPoints += 1;
  }

  // Compare pet preferences
  if (prefs1.pets !== undefined && prefs2.pets !== undefined) {
    matchPoints += prefs1.pets === prefs2.pets ? 1 : 0;
    totalPoints += 1;
  }

  // Compare gender preferences
  if (prefs1.gender !== undefined && prefs2.gender !== undefined) {
    if (prefs1.gender === "no_preference" || prefs2.gender === "no_preference") {
      matchPoints += 1;
    } else {
      matchPoints += prefs1.gender === prefs2.gender ? 1 : 0;
    }
    totalPoints += 1;
  }

  // Compare age range preferences
  if (prefs1.ageRange && prefs2.ageRange) {
    const [min1, max1] = prefs1.ageRange;
    const [min2, max2] = prefs2.ageRange;
    const overlap = Math.min(max1, max2) - Math.max(min1, min2);
    if (overlap >= 0) {
      const overlapRatio = overlap / Math.min(max1 - min1, max2 - min2);
      matchPoints += overlapRatio;
    }
    totalPoints += 1;
  }

  // Compare cleanliness preferences (1-5 scale)
  if (prefs1.cleanliness && prefs2.cleanliness) {
    const cleanlinessMatch = 1 - Math.abs(prefs1.cleanliness - prefs2.cleanliness) / 4;
    matchPoints += cleanlinessMatch;
    totalPoints += 1;
  }

  // Compare social level preferences (1-5 scale)
  if (prefs1.socialLevel && prefs2.socialLevel) {
    const socialMatch = 1 - Math.abs(prefs1.socialLevel - prefs2.socialLevel) / 4;
    matchPoints += socialMatch;
    totalPoints += 1;
  }

  // Compare work schedule preferences
  if (prefs1.workSchedule && prefs2.workSchedule) {
    if (prefs1.workSchedule === "flexible" || prefs2.workSchedule === "flexible") {
      matchPoints += 1;
    } else {
      matchPoints += prefs1.workSchedule === prefs2.workSchedule ? 1 : 0;
    }
    totalPoints += 1;
  }

  // Compare budget preferences
  if (prefs1.maxBudget && prefs2.maxBudget) {
    const budgetDiff = Math.abs(prefs1.maxBudget - prefs2.maxBudget);
    const maxBudget = Math.max(prefs1.maxBudget, prefs2.maxBudget);
    const budgetMatch = 1 - budgetDiff / maxBudget;
    matchPoints += Math.max(0, budgetMatch);
    totalPoints += 1;
  }

  return totalPoints > 0 ? matchPoints / totalPoints : 0;
}

/**
 * Compare two users' interests and return a similarity score between 0 and 1
 */
function compareInterests(interests1?: string[], interests2?: string[]): number {
  if (!interests1?.length || !interests2?.length) return 0;

  // Normalize interests (lowercase and trim)
  const normalizedInterests1 = interests1.map((i) => i.toLowerCase().trim());
  const normalizedInterests2 = interests2.map((i) => i.toLowerCase().trim());

  // Find common interests
  const common = normalizedInterests1.filter((i) =>
    normalizedInterests2.includes(i)
  );

  // Calculate Jaccard similarity (intersection over union)
  const total = new Set([...normalizedInterests1, ...normalizedInterests2]).size;

  return common.length / total;
}