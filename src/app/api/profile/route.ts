// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensureUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface QuizResponse {
  age: number;
  gender: string;
  occupation: string;
  interests: string[];
  cleanliness: number;
  quietness: number;
  socialness: number;
  pets: boolean;
  smoking: boolean;
  maxRent: number;
  bio: string;
}

// Normalize DB record to ensure optional arrays/objects are set
const normalizeProfile = (p: any) => {
  if (!p) return p;
  return {
    ...p,
    interests: Array.isArray(p.interests) ? p.interests : [],
    preferences: {
      cleanliness: p.preferences?.cleanliness ?? 0,
      quietness: p.preferences?.quietness ?? 0,
      socialness: p.preferences?.socialness ?? 0,
      pets: Boolean(p.preferences?.pets),
      smoking: Boolean(p.preferences?.smoking),
      maxRent: Number.isFinite(p.preferences?.maxRent) ? Number(p.preferences.maxRent) : 0,
    },
  };
};

// Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await ensureUserExists(session);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        occupation: true,
        bio: true,
        interests: true,
        location: true,
        profileImage: true,
        image: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use profileImage if available, otherwise fall back to image
    const result = normalizeProfile(user);
    if (!result.profileImage && result.image) {
      result.profileImage = result.image;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Error fetching profile" }, { status: 500 });
  }
}

// Create new profile from quiz data
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    await ensureUserExists(session);

    // Build update data object
    const data: any = {};
    
    if (body.name !== undefined) data.name = body.name;
    if (body.age !== undefined) data.age = Number(body.age);
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.occupation !== undefined) data.occupation = body.occupation;
    if (body.bio !== undefined) data.bio = body.bio;
    if (Array.isArray(body.interests)) data.interests = body.interests;
    if (body.location !== undefined) data.location = body.location;
    if (body.preferences !== undefined) data.preferences = body.preferences;
    
    // Handle profile image - store in BOTH profileImage and image fields
    if (body.profileImage !== undefined) {
      if (typeof body.profileImage === 'string' && body.profileImage.trim() !== '') {
        data.profileImage = body.profileImage;
        data.image = body.profileImage; // Also update image field for compatibility
      } else if (body.profileImage === '' || body.profileImage === null) {
        data.profileImage = null;
        data.image = null;
      }
    }

    console.log('Creating/updating profile with data:', { ...data, bio: data.bio?.substring(0, 50) + '...' });

    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        occupation: true,
        bio: true,
        interests: true,
        location: true,
        profileImage: true,
        image: true,
        preferences: true,
      },
    });

    const result = normalizeProfile(updatedProfile);
    console.log('Profile updated successfully, profileImage:', result.profileImage);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ 
      error: "Error creating profile", 
      details: error.message 
    }, { status: 500 });
  }
}

// Update user profile (full edit)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    
    await ensureUserExists(session);
    
    // Build update data object
    const data: any = {};
    
    if (body.name !== undefined) data.name = body.name;
    if (body.age !== undefined) data.age = Number(body.age);
    if (body.gender !== undefined) data.gender = body.gender;
    if (body.occupation !== undefined) data.occupation = body.occupation;
    if (body.bio !== undefined) data.bio = body.bio;
    if (Array.isArray(body.interests)) data.interests = body.interests;
    if (body.location !== undefined) data.location = body.location;
    if (body.preferences !== undefined) data.preferences = body.preferences;
    
    // Handle profile image - store in BOTH profileImage and image fields
    if (body.profileImage !== undefined) {
      if (typeof body.profileImage === 'string' && body.profileImage.trim() !== '') {
        data.profileImage = body.profileImage;
        data.image = body.profileImage; // Also update image field for compatibility
      } else if (body.profileImage === '' || body.profileImage === null) {
        data.profileImage = null;
        data.image = null;
      }
    }

    console.log('Updating profile with data:', { ...data, bio: data.bio?.substring(0, 50) + '...' });

    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        occupation: true,
        bio: true,
        interests: true,
        location: true,
        profileImage: true,
        image: true,
        preferences: true,
      },
    });

    const result = normalizeProfile(updatedProfile);
    console.log('Profile updated successfully, profileImage:', result.profileImage);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Profile not found. Please try refreshing the page." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      error: "Error updating profile", 
      details: error.message 
    }, { status: 500 });
  }
}

// Update profile from quiz responses (partial)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const quizData: QuizResponse = await request.json();

    await ensureUserExists(session);

    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        age: quizData.age,
        gender: quizData.gender,
        occupation: quizData.occupation,
        interests: Array.isArray(quizData.interests) ? quizData.interests : [],
        bio: quizData.bio,
        preferences: {
          cleanliness: quizData.cleanliness,
          quietness: quizData.quietness,
          socialness: quizData.socialness,
          pets: quizData.pets,
          smoking: quizData.smoking,
          maxRent: quizData.maxRent,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        occupation: true,
        bio: true,
        interests: true,
        location: true,
        profileImage: true,
        image: true,
        preferences: true,
      },
    });

    const result = normalizeProfile(updatedProfile);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating profile from quiz:", error);
    return NextResponse.json({ 
      error: "Error updating profile from quiz",
      details: error.message 
    }, { status: 500 });
  }
}