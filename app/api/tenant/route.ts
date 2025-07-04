import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/tenant - Register new tenant
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, subdomain, contactEmail, rateLimitTier, maxRequestsPerHour, adminEmail, adminPassword } = data;
  const { isNonEmptyString, isValidEmail } = await import('../../../lib/validation');
  if (!name || !subdomain || !isNonEmptyString(contactEmail) || !isValidEmail(contactEmail) || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
  }
  // Reason: Ensures subdomain uniqueness and atomic creation of tenant+admin
  const exists = await prisma.tenant.findUnique({ where: { subdomain } });
  if (exists) {
    return NextResponse.json({ error: "Subdomain already exists" }, { status: 409 });
  }
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const tenant = await prisma.tenant.create({
    data: {
      name,
      subdomain,
      contactEmail,
      rateLimitTier,
      maxRequestsPerHour,
      users: {
        create: {
          email: adminEmail,
          passwordHash,
          role: "admin"
        }
      }
    },
    include: { users: true }
  });
  return NextResponse.json({ tenant });
}
