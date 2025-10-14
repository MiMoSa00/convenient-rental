import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

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

// Get user profile
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
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

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Error fetching profile" },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await request.json();

    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        occupation: data.occupation,
        bio: data.bio,
        interests: data.interests,
        location: data.location,
        profileImage: data.profileImage,
        preferences: data.preferences,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Error updating profile" },
      { status: 500 }
    );
  }
}

// Update profile from quiz responses
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const quizData: QuizResponse = await request.json();

    // Update user profile with quiz responses
    const updatedProfile = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        age: quizData.age,
        gender: quizData.gender,
        occupation: quizData.occupation,
        interests: quizData.interests,
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
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile from quiz:", error);
    return NextResponse.json(
      { error: "Error updating profile from quiz" },
      { status: 500 }
    );
  }
}