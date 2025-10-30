declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    auth: any;
    from: (table: string) => any;
    storage: any;
    [key: string]: any;
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): SupabaseClient;

  export * from '@supabase/supabase-js';
}