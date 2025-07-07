import { mockNextRequest, parseNextResponse } from './testHelpers';
import { GET as handler } from '@/app/api/chat/conversations/route';
import prisma from '@/lib/prisma';

const mockSession = {
  user: { id: 'test-user-id', tenantId: 'test-tenant-id' }
};

jest.mock('next-auth/react', () => ({
  getServerSession: jest.fn(() => mockSession)
}));

beforeEach(async () => {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
});

describe('GET /api/chat/conversations', () => {
  it('should list user conversations', async () => {
    await prisma.tenant.create({ data: { id: 'test-tenant-id', name: 'TestTenant', subdomain: 'testtenant', contactEmail: 'test@tenant.com', rateLimitTier: 'basic', maxRequestsPerHour: 100 } });
    await prisma.user.create({ data: { id: 'test-user-id', tenantId: 'test-tenant-id', email: 'user@test.com', passwordHash: 'hash', role: 'user' } });
    await prisma.conversation.create({ data: { id: 'test-conv-id', title: 'Test Chat', tenantId: 'test-tenant-id', participants: { connect: [{ id: 'test-user-id' }] } } });
    const req = mockNextRequest({ method: 'GET' });
    const res = await handler(req);
    const parsed = await parseNextResponse(res);
    expect(parsed.status).toBe(200);
    expect(Array.isArray(parsed.body)).toBe(true);
    expect(parsed.body[0].participants[0].id).toBe('test-user-id');
  });

  it('should return 401 if not authenticated', async () => {
    jest.mock('next-auth/react', () => ({ getServerSession: jest.fn(() => null) }));
    const req = mockNextRequest({ method: 'GET' });
    const res = await handler(req);
    const parsed = await parseNextResponse(res);
    expect(parsed.status).toBe(401);
  });
});
