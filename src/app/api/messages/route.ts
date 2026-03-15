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

export async function GET() {
  const messages = readData<Message>('messages.json');
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages = readData<Message>('messages.json');
  const count = messages.length + 1;

  const newMessage: Message = {
    id: `MSG-${String(count).padStart(3, '0')}`,
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
    read: false,
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  writeData('messages.json', messages);
  return NextResponse.json(newMessage, { status: 201 });
}
