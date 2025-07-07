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

describe('POST /api/chat/thread/[id]/reply', () => {
  it('should post a reply in a thread', async () => {
    await prisma.tenant.create({ data: { id: 'test-tenant-id', name: 'TestTenant', subdomain: 'testtenant', contactEmail: 'test@tenant.com', rateLimitTier: 'basic', maxRequestsPerHour: 100 } });
    await prisma.user.create({ data: { id: 'test-user-id', tenantId: 'test-tenant-id', email: 'user@test.com', passwordHash: 'hash', role: 'user' } });
    const conversation = await prisma.conversation.create({ data: { id: 'test-conv-id', title: 'Test Chat', tenantId: 'test-tenant-id', participants: { connect: [{ id: 'test-user-id' }] } } });
    const parentMsg = await prisma.message.create({ data: { id: 'msg-parent', conversationId: conversation.id, senderId: 'test-user-id', content: 'Parent' } });
    const res = await request(createServer(app))
      .post(`/api/chat/thread/${parentMsg.id}/reply`)
      .send({ conversationId: conversation.id, content: 'Reply!' });
    expect(res.statusCode).toBe(200);
    expect(res.body.threadParentId).toBe(parentMsg.id);
    expect(res.body.content).toBe('Reply!');
  });

  it('should fail if conversation not found', async () => {
    const res = await request(createServer(app))
      .post('/api/chat/thread/msg-parent/reply')
      .send({ conversationId: 'nonexistent', content: 'Reply!' });
    expect(res.statusCode).toBe(404);
  });

  it('should fail with invalid payload', async () => {
    const res = await request(createServer(app))
      .post('/api/chat/thread/msg-parent/reply')
      .send({ conversationId: '', content: '' });
    expect(res.statusCode).toBe(400);
  });
});
