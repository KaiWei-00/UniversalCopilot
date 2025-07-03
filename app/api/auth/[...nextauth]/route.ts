import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenant: { label: "Tenant Subdomain", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            tenant: { subdomain: credentials.tenant }
          },
          include: { tenant: true }
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          tenantSubdomain: user.tenant.subdomain
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
