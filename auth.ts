import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const baseAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...baseAdapter,
  async createUser(user) {
    const roleCookie = (await cookies()).get("likitha_auth_role")?.value;
    const role = roleCookie === "WRITER" ? "WRITER" : "READER";
    return baseAdapter.createUser!({
      ...user,
      displayName: "",
      profileComplete: false,
      role,
    } as AdapterUser & { role: typeof role });
  },
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["READER", "WRITER", "ADMIN"]),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        if (
          parsed.data.role === "ADMIN" &&
          parsed.data.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() &&
          process.env.ADMIN_PASSWORD &&
          parsed.data.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "environment-admin",
            email: process.env.ADMIN_EMAIL,
            name: "Likitha Admin",
            role: "ADMIN",
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (
          !user ||
          !user.passwordHash ||
          user.isBanned ||
          user.role !== parsed.data.role ||
          !(await bcrypt.compare(parsed.data.password, user.passwordHash))
        ) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const roleCookie = (await cookies()).get("likitha_auth_role")?.value;
        const requestedRole = roleCookie === "WRITER" ? "WRITER" : "READER";
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { role: true, isBanned: true },
        });

        if (!existingUser) return true;
        return !existingUser.isBanned && existingUser.role === requestedRole;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token, user }) {
      if (session.user?.email) {
        const databaseUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
          select: { role: true, isBanned: true },
        });

        if (databaseUser && !databaseUser.isBanned) {
          session.user.role = databaseUser.role;
        } else if (token?.role === "ADMIN") {
          session.user.role = "ADMIN";
        }
      } else {
        const sessionRole = token?.role ?? user?.role;
        if (session.user && (sessionRole === "READER" || sessionRole === "WRITER" || sessionRole === "ADMIN")) {
          session.user.role = sessionRole;
        }
      }

      return session;
    },
  },
});
