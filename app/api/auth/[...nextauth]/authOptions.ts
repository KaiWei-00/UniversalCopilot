import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";

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
      async authorize(credentials: { email?: string; password?: string; tenant?: string } | undefined) {
  // Delegates user authentication to a helper for separation of concerns.
  if (!credentials) return null;
  const { authorizeUser } = await import("../../../../lib/auth/authorizeUser");
  return authorizeUser({
    email: credentials.email!,
    password: credentials.password!,
    tenant: credentials.tenant!
  });
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
