import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

describe('Tenant Model', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a tenant with valid data', async () => {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        subdomain: 'testtenant',
        contactEmail: 'test@tenant.com',
        rateLimitTier: 'free',
        maxRequestsPerHour: 100,
      },
    });
    expect(tenant).toHaveProperty('id');
    await prisma.tenant.delete({ where: { id: tenant.id } });
  });

  it('should not allow duplicate subdomains', async () => {
    const t1 = await prisma.tenant.create({
      data: {
        name: 'T1',
        subdomain: 'duptest',
        contactEmail: 't1@dup.com',
        rateLimitTier: 'free',
        maxRequestsPerHour: 100,
      },
    });
    await expect(
      prisma.tenant.create({
        data: {
          name: 'T2',
          subdomain: 'duptest',
          contactEmail: 't2@dup.com',
          rateLimitTier: 'free',
          maxRequestsPerHour: 100,
        },
      })
    ).rejects.toThrow();
    await prisma.tenant.delete({ where: { id: t1.id } });
  });

  it('should require all required fields', async () => {
    await expect(
      prisma.tenant.create({ data: { name: 'Missing', subdomain: 'missing', rateLimitTier: 'free', maxRequestsPerHour: 100 } })
    ).rejects.toThrow();
  });
});
