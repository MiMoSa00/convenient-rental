// src/app/api/auth/login/route.ts - Supabase Login Solution
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface LoginRequest {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  message: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('Login endpoint called');
    
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: email and password',
          message: 'Validation failed'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format',
          message: 'Validation failed'
        },
        { status: 400 }
      );
    }

    console.log('Validation passed, authenticating with Supabase...');

    // Authenticate user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Auth error:', error.message);
      
      // Provide user-friendly error messages
      let errorMessage = 'Login failed';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          message: 'Authentication failed'
        },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      console.error('No user or session returned from Supabase');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication failed - no user data returned',
          message: 'Login failed'
        },
        { status: 401 }
      );
    }

    console.log('User authenticated successfully:', data.user.id);

    // Extract user name from metadata
    const userName = data.user.user_metadata?.name || 
                     data.user.user_metadata?.full_name || 
                     data.user.user_metadata?.display_name ||
                     data.user.email?.split('@')[0] || 
                     'User';

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: userName,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed. Please try again.',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}