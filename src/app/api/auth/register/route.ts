// src/app/api/auth/register/route.ts - Complete Supabase Solution
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface ApiResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    console.log('Registration endpoint called');
    
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;

    console.log('Registration attempt for:', email);

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: email, password, name',
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long',
          message: 'Validation failed'
        },
        { status: 400 }
      );
    }

    console.log('Validation passed, creating user with Supabase Auth...');

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
          display_name: name
        }
      }
    });

    if (error) {
      console.error('Supabase Auth error:', error.message);
      return NextResponse.json(
        { 
          success: false,
          error: error.message || 'Registration failed',
          message: 'Registration failed'
        },
        { status: 400 }
      );
    }

    if (!data.user) {
      console.error('No user returned from Supabase');
      return NextResponse.json(
        { 
          success: false,
          error: 'User creation failed - no user data returned',
          message: 'Registration failed'
        },
        { status: 400 }
      );
    }

    console.log('User created successfully with ID:', data.user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: name,
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Registration failed. Please try again.',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}