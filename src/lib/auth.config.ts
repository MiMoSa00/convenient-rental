import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client lazily to avoid build-time errors when env vars are missing
// This allows the build to succeed on Vercel even if env vars aren't set yet
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ CRITICAL: Supabase environment variables missing (SUPABASE_URL / SUPABASE_ANON_KEY).');
    throw new Error('Supabase environment variables are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing email or password in authorize');
          return null;
        }

        try {
          console.log('=== AUTH ATTEMPT START ===');
          console.log('Email:', credentials.email);

          const supabase = getSupabaseClient();

          // Use Supabase Auth to sign in with email/password
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            // Log full error for server-side debugging
            console.error('❌ Supabase signIn failed');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            // Return null so NextAuth responds with CredentialsSignin
            return null;
          }

          if (!data?.user) {
            console.error('⚠️ No user returned from Supabase during signIn. Data:', data);
            return null;
          }

          console.log('✅ Supabase auth successful for user:', data.user.id);
          console.log('=== AUTH ATTEMPT END ===');

          // Return user object for NextAuth
          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name ||
                  data.user.user_metadata?.full_name ||
                  data.user.email!.split('@')[0],
          };
        } catch (err) {
          console.error('❌ Authorization exception:', err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};