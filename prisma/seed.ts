import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed a default tenant and admin user
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Tenant',
      subdomain: 'demo',
      contactEmail: 'admin@demo.com',
      rateLimitTier: 'free',
      maxRequestsPerHour: 1000,
      users: {
        create: {
          email: 'admin@demo.com',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'admin',
        },
      },
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
