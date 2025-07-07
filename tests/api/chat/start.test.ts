import request from 'supertest';
import { createServer } from 'http';
import app from '@/app'; // Adjust if your Next.js app entry is different
import prisma from '@/lib/prisma';

// Mock session for authentication
const mockSession = {
  user: { id: 'test-user-id', tenantId: 'test-tenant-id' }
};

jest.mock('next-auth/react', () => ({
  getServerSession: jest.fn(() => mockSession)
}));

// Helper to reset DB state
beforeEach(async () => {
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
});

describe('POST /api/chat/start', () => {
  it('should create a new conversation with valid data', async () => {
    // Seed test user and tenant
    await prisma.tenant.create({
      data: { id: 'test-tenant-id', name: 'TestTenant', subdomain: 'testtenant', contactEmail: 'test@tenant.com', rateLimitTier: 'basic', maxRequestsPerHour: 100 }
    });
    await prisma.user.create({
      data: { id: 'test-user-id', tenantId: 'test-tenant-id', email: 'user@test.com', passwordHash: 'hash', role: 'user' }
    });
    const res = await request(createServer(app))
      .post('/api/chat/start')
      .send({ title: 'Test Chat', participantIds: ['test-user-id'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Chat');
    expect(res.body.participants[0].id).toBe('test-user-id');
  });

  it('should fail if not authenticated', async () => {
    jest.mock('next-auth/react', () => ({ getServerSession: jest.fn(() => null) }));
    const res = await request(createServer(app))
      .post('/api/chat/start')
      .send({ title: 'Test Chat', participantIds: ['test-user-id'] });
    expect(res.statusCode).toBe(401);
  });

  it('should fail with invalid payload', async () => {
    const res = await request(createServer(app))
      .post('/api/chat/start')
      .send({ title: '', participantIds: [] });
    expect(res.statusCode).toBe(400);
  });
});
