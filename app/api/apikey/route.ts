import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// POST /api/apikey - Generate new API key for tenant
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { tenantSubdomain } = data;
  if (!tenantSubdomain) {
    return NextResponse.json({ error: "Missing tenant subdomain" }, { status: 400 });
  }
  const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSubdomain } });
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }
  // Reason: API keys are random, unique, and stored hashed for security
  const rawKey = randomBytes(32).toString("hex");
  const bcrypt = require('bcryptjs');
  const hashedKey = await bcrypt.hash(rawKey, 10);
  const apiKey = await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      key: hashedKey,
      status: "active"
    }
  });
  return NextResponse.json({ apiKey: { id: apiKey.id, status: apiKey.status, createdAt: apiKey.createdAt, raw: rawKey } });
}

// PATCH /api/apikey - Revoke or regenerate API key
export async function PATCH(req: NextRequest) {
  try {
    // Admin check (assume session token in header, e.g. req.headers.get('x-user-role'))
    const role = req.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    const data = await req.json();
    const { apiKeyId, action } = data;
    if (!apiKeyId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const apiKey = await prisma.apiKey.findUnique({ where: { id: apiKeyId } });
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
    // Optionally: check tenant ownership here
    if (action === "revoke") {
      const updatedKey = await prisma.apiKey.update({ where: { id: apiKeyId }, data: { status: "revoked" } });
      return NextResponse.json({ apiKey: updatedKey });
    } else if (action === "regenerate") {
      const rawKey = randomBytes(32).toString("hex");
      const bcrypt = require('bcryptjs');
      const hashedKey = await bcrypt.hash(rawKey, 10);
      const updatedKey = await prisma.apiKey.update({ where: { id: apiKeyId }, data: { key: hashedKey, status: "active" } });
      return NextResponse.json({ apiKey: { id: updatedKey.id, status: updatedKey.status, createdAt: updatedKey.createdAt, raw: rawKey } });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}
