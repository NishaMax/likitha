import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "READER" | "WRITER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "READER" | "WRITER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "READER" | "WRITER" | "ADMIN";
  }
}
