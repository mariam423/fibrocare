import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      signupRole: "PATIENT" | "DOCTOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    signupRole?: "PATIENT" | "DOCTOR";
  }
}
