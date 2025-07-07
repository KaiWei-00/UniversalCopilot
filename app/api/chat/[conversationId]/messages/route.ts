import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import prisma from '../../../../../lib/prisma';

// GET /api/chat/:conversationId/messages: Get message history (paginated)
export async function GET(req: NextRequest, { params }: { params: { conversationId: string } }) {
  const { conversationId } = params;
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; tenantId: string };
  if (!user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, tenantId: user.tenantId },
      select: { id: true }
    });
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        sender: true,
        threadParent: true,
        threadReplies: true
      }
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
