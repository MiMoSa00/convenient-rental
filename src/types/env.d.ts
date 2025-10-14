// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      DATABASE_URL: string
      DIRECT_URL: string
    }
  }
}

export {}