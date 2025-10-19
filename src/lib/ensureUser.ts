// lib/ensureUser.ts
  import { prisma } from "@/lib/prisma";
  import type { Session } from "next-auth";
  import type { User } from "@prisma/client";
  import { randomBytes } from "crypto";

  /**
   * Ensures that a user exists in the database for the given session.
   * If the user doesn't exist, creates a basic user record.
   * Returns the user record.
   *
   * Note: Your Prisma User model requires a `password` field. Since OAuth users
   * don't have app-managed passwords, we generate a secure random string to satisfy
   * the schema. If you don't need passwords for OAuth users, consider making
   * `password` optional in your Prisma schema instead.
   */
  export async function ensureUserExists(session: Session): Promise<User> {
    if (!session?.user?.email) {
      throw new Error("No email in session");
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log(`Creating user record for ${session.user.email}`);

      // Generate a secure random password to satisfy the required field
      const generatedPassword = randomBytes(32).toString("hex");

      try {
        user = await prisma.user.create({
          data: {
            email: session.user.email,
            name: session.user.name || session.user.email.split("@")[0],
            password: generatedPassword, // Required by schema
          },
        });
        console.log(`User created successfully: ${user.id}`);
      } catch (error: any) {
        console.error("Error creating user:", error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
    }

    return user;
  }