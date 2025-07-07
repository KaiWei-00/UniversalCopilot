import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/authOptions';
import prisma from '../../../../../lib/prisma';

// DELETE /api/chat/conversations/:id: Delete (close) a conversation
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: string; tenantId: string };
  if (!user?.tenantId || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = params;
  try {
    // Only allow deleting conversations belonging to the tenant and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id, tenantId: user.tenantId },
      include: { participants: true }
    });
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    if (!conversation.participants.some((p: any) => p.id === user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await prisma.conversation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
