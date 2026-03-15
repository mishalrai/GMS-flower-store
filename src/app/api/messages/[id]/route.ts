import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const messages = readData<Message>('messages.json');
  const index = messages.findIndex((m) => m.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  messages[index] = { ...messages[index], ...body, id: messages[index].id };
  writeData('messages.json', messages);
  return NextResponse.json(messages[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const messages = readData<Message>('messages.json');
  const updated = messages.filter((m) => m.id !== id);

  if (updated.length === messages.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  writeData('messages.json', updated);
  return NextResponse.json({ success: true });
}
