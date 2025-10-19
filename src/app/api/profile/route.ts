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

    // Ensure user exists in database
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
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeProfile(user));
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

    // Ensure user exists in database
    await ensureUserExists(session);

    // Update the user with profile data from quiz
    const data = {
      name: body.name ?? undefined,
      age: body.age ?? undefined,
      gender: body.gender ?? undefined,
      occupation: body.occupation ?? undefined,
      bio: body.bio ?? undefined,
      interests: Array.isArray(body.interests) ? body.interests : undefined,
      location: body.location ?? undefined,
      profileImage: body.profileImage ?? undefined,
      preferences: body.preferences ?? undefined,
    };

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
        preferences: true,
      },
    });

    return NextResponse.json(normalizeProfile(updatedProfile), { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error: "Error creating profile" }, { status: 500 });
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
    
    // Ensure user exists in database
    await ensureUserExists(session);
    
    // Pick only the fields we allow to be updated
    const data = {
      name: body.name ?? undefined,
      age: body.age ?? undefined,
      gender: body.gender ?? undefined,
      occupation: body.occupation ?? undefined,
      bio: body.bio ?? undefined,
      interests: Array.isArray(body.interests) ? body.interests : undefined,
      location: body.location ?? undefined,
      profileImage: body.profileImage ?? undefined,
      preferences: body.preferences ?? undefined,
    };

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
        preferences: true,
      },
    });

    return NextResponse.json(normalizeProfile(updatedProfile));
  } catch (error: any) {
    console.error("Error updating profile:", error);
    
    // Check if it's a "record not found" error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Profile not found. Please try refreshing the page." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ error: "Error updating profile" }, { status: 500 });
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

    // Ensure user exists in database
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
        preferences: true,
      },
    });

    return NextResponse.json(normalizeProfile(updatedProfile));
  } catch (error) {
    console.error("Error updating profile from quiz:", error);
    return NextResponse.json({ error: "Error updating profile from quiz" }, { status: 500 });
  }
}