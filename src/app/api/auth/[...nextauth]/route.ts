import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth.config";

// Dynamic URL configuration for different environments
const url = process.env.NEXTAUTH_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const handler = NextAuth({
  ...authOptions,
  // Override the URL dynamically if needed
  // NextAuth will use NEXTAUTH_URL env var by default, but this ensures fallback
});

export { handler as GET, handler as POST };