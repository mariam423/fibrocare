import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log("[auth-route] Request hit /api/auth/[...nextauth]");

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
