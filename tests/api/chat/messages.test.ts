import request from 'supertest';
import { createServer } from 'http';
import app from '@/app';
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

describe('GET /api/chat/[conversationId]/messages', () => {
  it('should get message history for a conversation', async () => {
    await prisma.tenant.create({ data: { id: 'test-tenant-id', name: 'TestTenant', subdomain: 'testtenant', contactEmail: 'test@tenant.com', rateLimitTier: 'basic', maxRequestsPerHour: 100 } });
    await prisma.user.create({ data: { id: 'test-user-id', tenantId: 'test-tenant-id', email: 'user@test.com', passwordHash: 'hash', role: 'user' } });
    const conversation = await prisma.conversation.create({ data: { id: 'test-conv-id', title: 'Test Chat', tenantId: 'test-tenant-id', participants: { connect: [{ id: 'test-user-id' }] } } });
    await prisma.message.create({ data: { id: 'msg-1', conversationId: conversation.id, senderId: 'test-user-id', content: 'Hello!' } });
    const res = await request(createServer(app)).get(`/api/chat/${conversation.id}/messages`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].content).toBe('Hello!');
  });

  it('should return 404 if conversation not found', async () => {
    const res = await request(createServer(app)).get('/api/chat/nonexistent/messages');
    expect(res.statusCode).toBe(404);
  });

  it('should return 401 if not authenticated', async () => {
    jest.mock('next-auth/react', () => ({ getServerSession: jest.fn(() => null) }));
    const res = await request(createServer(app)).get('/api/chat/test-conv-id/messages');
    expect(res.statusCode).toBe(401);
  });
});
