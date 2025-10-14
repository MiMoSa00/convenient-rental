// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Define your database types (you can generate these later with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)