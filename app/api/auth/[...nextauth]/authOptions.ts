import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
  session: {
    strategy: "jwt" as import("next-auth").SessionStrategy
  },
  callbacks: {
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string | undefined;
        (session.user as any).tenantId = token.tenantId as string | undefined;
        (session.user as any).role = token.role as string | undefined;
        (session.user as any).tenantSubdomain = token.tenantSubdomain as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User | null }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.tenantSubdomain = (user as any).tenantSubdomain;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
