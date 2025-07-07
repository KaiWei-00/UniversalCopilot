import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import prisma from '../../../../lib/prisma';

// GET /api/chat/conversations: List user's conversations
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; tenantId: string };
  if (!user?.tenantId || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        tenantId: user.tenantId,
        participants: {
          some: { id: user.id }
        }
      },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(conversations);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
