import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed a default tenant and admin user
  // Ensure demo tenant exists for tests (do not assign id directly)
  let tenant = await prisma.tenant.findUnique({ where: { subdomain: 'demo' } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Tenant',
        subdomain: 'demo',
        contactEmail: 'admin@demo.com',
        rateLimitTier: 'free',
        maxRequestsPerHour: 1000,
      },
    });
  }
  // Ensure at least one admin user for this tenant
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.com' } },
    update: {},
    create: {
      email: 'admin@demo.com',
      passwordHash: await bcrypt.hash('password', 10),
      role: 'admin',
      tenantId: tenant.id,
    },
  });

  console.log('Seeded tenant:', tenant);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
