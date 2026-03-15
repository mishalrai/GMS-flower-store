import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Banner { id: number; [key: string]: unknown; }

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const banners = readData<Banner>('banners.json');
  const index = banners.findIndex(b => b.id === Number(id));
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  banners[index] = { ...banners[index], ...body, id: Number(id) };
  writeData('banners.json', banners);
  return NextResponse.json(banners[index]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banners = readData<Banner>('banners.json');
  const filtered = banners.filter(b => b.id !== Number(id));
  if (filtered.length === banners.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeData('banners.json', filtered);
  return NextResponse.json({ success: true });
}
