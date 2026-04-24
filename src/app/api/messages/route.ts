import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lastMsg = await prisma.message.findFirst({ orderBy: { createdAt: 'desc' } });
  const lastMsgNum = lastMsg ? parseInt(lastMsg.id.replace('MSG-', ''), 10) : 0;
  const message = await prisma.message.create({
    data: {
      id: `MSG-${String(lastMsgNum + 1).padStart(3, '0')}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      message: body.message,
      read: false,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
