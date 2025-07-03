import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/apikey-list?tenantId=...
export async function GET(req: NextRequest) {
  try {
    // Admin check (assume session token in header, e.g. req.headers.get('x-user-role'))
    const role = req.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }
    const apiKeys = await prisma.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });
    return NextResponse.json({ apiKeys });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}
