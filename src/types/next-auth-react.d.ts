declare module "next-auth/react" {
  export * from "next-auth/react/types";

  export function useSession(): { data: any; } {
    throw new Error("Function not implemented.");
  }

  export function signOut(arg0: { callbackUrl: string; }): void {
    throw new Error("Function not implemented.");
  }
}