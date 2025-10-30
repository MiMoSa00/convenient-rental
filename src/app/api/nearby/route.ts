import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RoommatePreferences {
  cleanliness?: number;
  socialLevel?: number;
  smoking?: boolean;
  pets?: boolean;
}

interface UserMatchData {
  preferences: RoommatePreferences;
  interests: string[];
}

// Add Property interface
interface Property {
  id: number;
  latitude: number | null;
  longitude: number | null;
  price: number;
  isAvailable: boolean;
  [key: string]: any; // Allow other properties
}

// Add PropertyWithDistance interface
interface PropertyWithDistance extends Property {
  distance: number;
}

// Add Roommate interface
interface Roommate {
  id: number;
  name: string | null;
  age: number | null;
  occupation: string | null;
  profileImage: string | null;
  latitude: number | null;
  longitude: number | null;
  preferences: any;
  interests: string[] | null;
  lookingForRoommate: boolean;
}

// Add RoommateWithMatch interface
interface RoommateWithMatch {
  id: number;
  name: string;
  age: number;
  occupation: string;
  profileImage: string | null;
  latitude: number;
  longitude: number;
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

    // Validate inputs
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Invalid location coordinates" },
        { status: 400 }
      );
    }

    if (isNaN(radius) || radius <= 0) {
      return NextResponse.json(
        { error: "Invalid radius" },
        { status: 400 }
      );
    }

    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < minPrice) {
      return NextResponse.json(
        { error: "Invalid price range" },
        { status: 400 }
      );
    }

    // Get current user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : undefined;

    // Calculate bounding box
    const milesPerLat = 69;
    const milesPerLng = 69 * Math.cos(lat * (Math.PI / 180));
    const latRadius = radius / milesPerLat;
    const lngRadius = radius / milesPerLng;

    const minLat = lat - latRadius;
    const maxLat = lat + latRadius;
    const minLng = lng - lngRadius;
    const maxLng = lng + lngRadius;

    // Fetch properties
    let properties: PropertyWithDistance[] = [];
    if (filter === "all" || filter === "properties") {
      const rawProperties = await prisma.property.findMany({
        where: {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLng, lte: maxLng },
          price: { gte: minPrice, lte: maxPrice },
          isAvailable: true,
        },
      });

      properties = rawProperties
        .map((p: Property): PropertyWithDistance => ({
          ...p,
          distance: calculateDistance(lat, lng, p.latitude || 0, p.longitude || 0),
        }))
        .filter((p: PropertyWithDistance) => p.distance <= radius)
        .sort((a: PropertyWithDistance, b: PropertyWithDistance) => a.distance - b.distance);
    }

    // Fetch roommates
    let roommates: RoommateWithMatch[] = [];
    if (filter === "all" || filter === "roommates") {
      const rawRoommates = await prisma.user.findMany({
        where: {
          ...(userId && { id: { not: userId } }),
          latitude: { not: null, gte: minLat, lte: maxLat },
          longitude: { not: null, gte: minLng, lte: maxLng },
          lookingForRoommate: true,
        },
      });

      // Get current user for matching
      let currentUserData: UserMatchData | null = null;
      if (userId) {
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (currentUser) {
          currentUserData = {
            preferences: (currentUser.preferences as RoommatePreferences) || {},
            interests: currentUser.interests || [],
          };
        }
      }

      roommates = rawRoommates
        .map((r: Roommate): RoommateWithMatch | null => {
          if (!r.latitude || !r.longitude) return null;

          const distance = calculateDistance(lat, lng, r.latitude, r.longitude);
          const matchPercentage = currentUserData
            ? calculateMatchPercentage(currentUserData, {
                preferences: (r.preferences as RoommatePreferences) || {},
                interests: r.interests || [],
              })
            : 0;

          return {
            id: r.id,
            name: r.name || "User",
            age: r.age ?? 0,
            occupation: r.occupation ?? "Not specified",
            profileImage: r.profileImage,
            latitude: r.latitude,
            longitude: r.longitude,
            distance,
            matchPercentage,
            interests: r.interests || [],
            preferences: (r.preferences as RoommatePreferences) || {},
          };
        })
        .filter((r): r is RoommateWithMatch => r !== null && r.distance <= radius)
        .sort((a: RoommateWithMatch, b: RoommateWithMatch) => b.matchPercentage - a.matchPercentage);
    }

    return NextResponse.json({ properties, roommates });
  } catch (error) {
    console.error("Nearby error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching nearby items" },
      { status: 500 }
    );
  }
}

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
  return Math.round((R * c) * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function calculateMatchPercentage(
  user1: UserMatchData,
  user2: UserMatchData
): number {
  const preferencesMatch = comparePreferences(user1.preferences, user2.preferences);
  const interestsMatch = compareInterests(user1.interests, user2.interests);
  const matchPercentage = Math.round((preferencesMatch * 0.7 + interestsMatch * 0.3) * 100);
  return Math.max(0, Math.min(100, matchPercentage));
}

function comparePreferences(
  prefs1: RoommatePreferences,
  prefs2: RoommatePreferences
): number {
  if (!prefs1 || !prefs2) return 0;

  let matchPoints = 0;
  let totalPoints = 0;

  if (prefs1.smoking !== undefined && prefs2.smoking !== undefined) {
    matchPoints += prefs1.smoking === prefs2.smoking ? 1 : 0;
    totalPoints += 1;
  }

  if (prefs1.pets !== undefined && prefs2.pets !== undefined) {
    matchPoints += prefs1.pets === prefs2.pets ? 1 : 0;
    totalPoints += 1;
  }

  if (prefs1.cleanliness && prefs2.cleanliness) {
    const cleanlinessMatch = 1 - Math.abs(prefs1.cleanliness - prefs2.cleanliness) / 4;
    matchPoints += cleanlinessMatch;
    totalPoints += 1;
  }

  if (prefs1.socialLevel && prefs2.socialLevel) {
    const socialMatch = 1 - Math.abs(prefs1.socialLevel - prefs2.socialLevel) / 4;
    matchPoints += socialMatch;
    totalPoints += 1;
  }

  return totalPoints > 0 ? matchPoints / totalPoints : 0;
}

function compareInterests(interests1?: string[], interests2?: string[]): number {
  if (!interests1?.length || !interests2?.length) return 0;

  const norm1 = interests1.map((i: string) => i.toLowerCase().trim());
  const norm2 = interests2.map((i: string) => i.toLowerCase().trim());

  const common = norm1.filter((i: string) => norm2.includes(i));
  const total = new Set([...norm1, ...norm2]).size;

  return common.length / total;
}