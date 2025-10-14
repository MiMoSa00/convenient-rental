import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { calculateCompatibilityScore } from '@/lib/compatibility';
import type { 
  RoommateRequestWithUser, 
  CompatibilityScore, 
  RoommateMatch,
  CreateRoommateRequestData 
} from '@/types/roommate';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userIdRaw = session?.user?.id;
    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw) : userIdRaw;
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json() as CreateRoommateRequestData;
    // Validate required fields
    if (!data.budget || !data.moveInDate || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: budget, moveInDate, location' },
        { status: 400 }
      );
    }

    // Create new roommate request
    const roommateRequest = await prisma.roommateRequest.create({
      data: {
        userId,
        budget: data.budget.max, // or data.budget.min depending on your requirements
        moveInDate: new Date(data.moveInDate),
  duration: typeof data.duration === 'number' ? data.duration : (typeof data.duration === 'string' ? parseInt(data.duration) || 0 : 0),
  lifestyle: data.lifestyle ?? [],
  location: data.location,
  cleaningHabits: data.cleaningHabits ?? '',
  smokingTolerance: data.smokingTolerance ?? '',
  petPreference: data.petPreference ?? '',
  workSchedule: data.workSchedule ?? '',
  guestHabits: data.guestHabits ?? '',
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Find potential matches
    const potentialMatches = await prisma.roommateRequest.findMany({
      where: {
        status: 'ACTIVE',
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate compatibility scores and create matches
    const matchPromises = potentialMatches.map(async (match: RoommateRequestWithUser): Promise<RoommateMatch | null> => {
      try {
        const currentRequest: RoommateRequestWithUser = {
          ...roommateRequest,
          userId: roommateRequest.userId,
          status: roommateRequest.status || 'ACTIVE',
        };
        const score: CompatibilityScore = calculateCompatibilityScore(currentRequest, match);
        if (score.score >= 0.6) {
          const createdMatch = await prisma.roommateMatch.create({
            data: {
              requestOneId: roommateRequest.id,
              requestTwoId: match.id,
              compatibilityScore: score.score,
            },
          });
          return {
            id: createdMatch.id.toString(),
            requestOneId: createdMatch.requestOneId,
            requestTwoId: createdMatch.requestTwoId,
            compatibilityScore: createdMatch.compatibilityScore,
            createdAt: createdMatch.createdAt,
            updatedAt: createdMatch.updatedAt,
          };
        }
        return null;
      } catch (matchError) {
        console.error('Error creating individual match:', matchError);
        return null;
      }
    });

    const matches = await Promise.all(matchPromises);
    const validMatches = matches.filter((match): match is RoommateMatch => match !== null);

    return NextResponse.json({
      success: true,
      request: roommateRequest,
      matches: validMatches,
      matchCount: validMatches.length,
    });

  } catch (error: any) {
    console.error('Error in roommate matching:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'A roommate request already exists for this user' },
        { status: 409 }
      );
    }
    if (error?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid user reference' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userIdRaw = session?.user?.id;
    const userId = typeof userIdRaw === 'string' ? parseInt(userIdRaw) : userIdRaw;
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's roommate requests
    const userRequests = await prisma.roommateRequest.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get matches for user's requests
    const matches = await prisma.roommateMatch.findMany({
      where: {
        OR: [
          { requestOne: { userId } },
          { requestTwo: { userId } },
        ],
      },
      include: {
        requestOne: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        requestTwo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { compatibilityScore: 'desc' },
    });

    return NextResponse.json({
      success: true,
      requests: userRequests,
      matches,
    });

  } catch (error: any) {
    console.error('Error fetching roommate data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}