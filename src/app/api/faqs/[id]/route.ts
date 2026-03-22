import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const faqs = readData<FAQ>('faqs.json');
  const index = faqs.findIndex(f => f.id === Number(id));
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  faqs[index] = { ...faqs[index], ...body, id: Number(id) };
  writeData('faqs.json', faqs);
  return NextResponse.json(faqs[index]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faqs = readData<FAQ>('faqs.json');
  const filtered = faqs.filter(f => f.id !== Number(id));
  if (filtered.length === faqs.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeData('faqs.json', filtered);
  return NextResponse.json({ success: true });
}
