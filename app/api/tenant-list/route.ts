import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/tenant-list - List all tenants (admin only)
export async function GET(req: NextRequest) {
  try {
    // Admin check (assume session token in header, e.g. req.headers.get('x-user-role'))
    const role = req.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        contactEmail: true
      }
    });
    return NextResponse.json({ tenants });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}
