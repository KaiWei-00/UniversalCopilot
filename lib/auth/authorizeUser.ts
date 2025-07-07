import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Authenticates a user given email, password, and tenant subdomain.
 * Returns the user object if valid, otherwise null.
 */
export async function authorizeUser({ email, password, tenant }: { email: string; password: string; tenant: string }) {
  console.log("AUTH: Attempt login", { email, tenant });
  if (!email || !password || !tenant) {
    console.log("AUTH: Missing credentials", { email, password, tenant });
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      email,
      tenant: { subdomain: tenant }
    },
    include: { tenant: true }
  });
  if (!user) {
    console.log("AUTH: User not found for", { email, tenant });
    return null;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    console.log("AUTH: Invalid password for", email);
    return null;
  }
  console.log("AUTH: Success", email);
  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    role: user.role,
    tenantSubdomain: user.tenant.subdomain
  };
}
