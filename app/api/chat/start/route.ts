import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import prisma from '../../../../lib/prisma';

// POST /api/chat/start: Create new conversation
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; tenantId: string };
  if (!user?.tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, participantIds } = await req.json();
  if (!title || !participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  try {
    const conversation = await prisma.conversation.create({
      data: {
        title,
        tenantId: user.tenantId,
        participants: {
          connect: participantIds.map((id: string) => ({ id }))
        }
      },
      include: { participants: true }
    });
    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
