import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  export interface AuthOptions {
    providers: any[];
    secret?: string;
    session?: {
      strategy: 'jwt' | 'database';
      maxAge?: number;
    };
    pages?: {
      signIn?: string;
      signOut?: string;
      error?: string;
      verifyRequest?: string;
      newUser?: string;
    };
    callbacks?: {
      jwt?: (params: any) => Promise<any>;
      session?: (params: any) => Promise<any>;
      signIn?: (params: any) => Promise<boolean>;
      redirect?: (params: any) => Promise<string>;
    };
    debug?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

declare module "next-auth/react" {
  export interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  export function useSession(): {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    update: (data?: any) => Promise<Session | null>;
  };

  export function signIn(
    provider?: string,
    options?: {
      callbackUrl?: string;
      redirect?: boolean;
      email?: string;
      password?: string;
      [key: string]: any;
    }
  ): Promise<{
    error?: string;
    status?: number;
    ok?: boolean;
    url?: string | null;
  } | undefined>;

  export function signOut(options?: {
    callbackUrl?: string;
    redirect?: boolean;
  }): Promise<void>;

  export function getCsrfToken(): Promise<string | undefined>;
  
  export function getProviders(): Promise<Record<string, any> | null>;

  export const SessionProvider: React.ComponentType<{
    children: React.ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
  }>;
}

declare module "next-auth/providers/credentials" {
  export interface CredentialsConfig {
    id?: string;
    name?: string;
    type?: string;
    credentials?: Record<string, any>;
    authorize?: (credentials: any, req: any) => Promise<any>;
  }

  export default function Credentials(options: CredentialsConfig): any;
}