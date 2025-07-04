import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Authenticates a user given email, password, and tenant subdomain.
 * Returns the user object if valid, otherwise null.
 */
export async function authorizeUser({ email, password, tenant }: { email: string; password: string; tenant: string }) {
  if (!email || !password || !tenant) return null;
  const user = await prisma.user.findFirst({
    where: {
      email,
      tenant: { subdomain: tenant }
    },
    include: { tenant: true }
  });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;
  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
    tenantSubdomain: user.tenant.subdomain
  };
}
