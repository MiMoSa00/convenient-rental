// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ensureUserExists } from "@/lib/ensureUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  privateProfile: boolean;
  allowRoommateMatching: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  privateProfile: false,
  allowRoommateMatching: true,
  theme: "auto",
  language: "en",
  timezone: "UTC",
  twoFactorEnabled: false,
};

// Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Ensure user exists
    await ensureUserExists(session);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse settings or use defaults
    let settings: UserSettings = defaultSettings;
    if (user.settings && typeof user.settings === "object") {
      settings = { ...defaultSettings, ...(user.settings as Partial<UserSettings>) };
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
  }
}

// Update user settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Ensure user exists
    await ensureUserExists(session);

    const body = await request.json();

    // Build settings object with validation
    const settings: Partial<UserSettings> = {};

    if (typeof body.emailNotifications === "boolean") {
      settings.emailNotifications = body.emailNotifications;
    }
    if (typeof body.pushNotifications === "boolean") {
      settings.pushNotifications = body.pushNotifications;
    }
    if (typeof body.marketingEmails === "boolean") {
      settings.marketingEmails = body.marketingEmails;
    }
    if (typeof body.privateProfile === "boolean") {
      settings.privateProfile = body.privateProfile;
    }
    if (typeof body.allowRoommateMatching === "boolean") {
      settings.allowRoommateMatching = body.allowRoommateMatching;
    }
    if (body.theme && ["light", "dark", "auto"].includes(body.theme)) {
      settings.theme = body.theme;
    }
    if (body.language) {
      settings.language = body.language;
    }
    if (body.timezone) {
      settings.timezone = body.timezone;
    }
    if (typeof body.twoFactorEnabled === "boolean") {
      settings.twoFactorEnabled = body.twoFactorEnabled;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        settings: settings as any,
      },
      select: {
        id: true,
        email: true,
        settings: true,
      },
    });

    // Parse updated settings
    let updatedSettings: UserSettings = defaultSettings;
    if (updatedUser.settings && typeof updatedUser.settings === "object") {
      updatedSettings = { ...defaultSettings, ...(updatedUser.settings as Partial<UserSettings>) };
    }

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      settings: updatedSettings,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
  }
}

// Delete account
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Delete user and related data
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Error deleting account" }, { status: 500 });
  }
}