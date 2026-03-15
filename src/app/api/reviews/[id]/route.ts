import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Review { id: string; [key: string]: unknown; }

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reviews = readData<Review>('reviews.json');
  const filtered = reviews.filter(r => r.id !== id);
  if (filtered.length === reviews.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeData('reviews.json', filtered);
  return NextResponse.json({ success: true });
}
