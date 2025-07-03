import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/ratelimit?tenantSubdomain=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantSubdomain = searchParams.get("tenantSubdomain");
  if (!tenantSubdomain) {
    return NextResponse.json({ error: "Missing tenant subdomain" }, { status: 400 });
  }
  const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSubdomain } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  // Reason: Track usage for tenant and return current usage/max
  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  const usage = await prisma.rateLimitUsage.findFirst({
    where: {
      tenantId: tenant.id,
      window: windowStart
    }
  });
  return NextResponse.json({
    used: usage ? usage.used : 0,
    max: tenant.maxRequestsPerHour
  });
}
