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
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: z.enum(["READER", "WRITER", "ADMIN"]),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter,
  session: { strategy: "jwt" },
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

        const inputEmail = parsed.data.email.trim().toLowerCase();
        const configuredAdminEmail = process.env.ADMIN_EMAIL?.replace(/^["']|["']$/g, "").trim().toLowerCase();
        const configuredAdminPassword = process.env.ADMIN_PASSWORD?.replace(/^["']|["']$/g, "").trim();

        if (
          parsed.data.role === "ADMIN" &&
          configuredAdminEmail &&
          configuredAdminPassword &&
          inputEmail === configuredAdminEmail &&
          parsed.data.password.trim() === configuredAdminPassword
        ) {
          try {
            let adminUser = await prisma.user.findUnique({
              where: { email: configuredAdminEmail },
            });

            if (!adminUser) {
              adminUser = await prisma.user.create({
                data: {
                  email: configuredAdminEmail,
                  displayName: "Likitha Admin",
                  role: "ADMIN",
                  profileComplete: true,
                },
              });
            } else if (adminUser.role !== "ADMIN") {
              adminUser = await prisma.user.update({
                where: { email: configuredAdminEmail },
                data: { role: "ADMIN" },
              });
            }

            return {
              id: adminUser.id,
              email: adminUser.email,
              name: adminUser.displayName || "Likitha Admin",
              role: "ADMIN",
            };
          } catch {
            return {
              id: "environment-admin",
              email: configuredAdminEmail,
              name: "Likitha Admin",
              role: "ADMIN",
            };
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: inputEmail },
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
      if (user) {
        if (user.role) token.role = user.role;
        if (user.id) token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (token.role) {
          session.user.role = token.role as "READER" | "WRITER" | "ADMIN";
        }
        if (token.id || token.sub) {
          session.user.id = (token.id as string) ?? (token.sub as string);
        }
      }

      const configuredAdminEmail = process.env.ADMIN_EMAIL?.replace(/^["']|["']$/g, "").trim().toLowerCase();
      if (
        token?.role === "ADMIN" ||
        (session.user?.email &&
          configuredAdminEmail &&
          session.user.email.toLowerCase() === configuredAdminEmail)
      ) {
        session.user.role = "ADMIN";
        return session;
      }

      if (session.user?.email && session.user.role !== "ADMIN") {
        const databaseUser = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
          select: { id: true, role: true, isBanned: true },
        });

        if (databaseUser && !databaseUser.isBanned) {
          session.user.role = databaseUser.role;
          session.user.id = databaseUser.id;
        }
      }

      return session;
    },
  },
});
