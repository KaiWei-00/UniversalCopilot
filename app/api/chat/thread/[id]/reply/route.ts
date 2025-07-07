import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';


// POST /api/chat/thread/:id/reply: Post a reply in a thread
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; tenantId: string };
  if (!user?.tenantId || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id: threadParentId } = params;
  const { conversationId, content } = await req.json();
  if (!conversationId || !content) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  try {
    // Ensure conversation belongs to tenant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, tenantId: user.tenantId }
    });
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    const reply = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        threadParentId,
        content
      }
    });
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
