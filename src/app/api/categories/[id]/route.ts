import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Category { id: number; [key: string]: unknown; }

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const categories = readData<Category>('categories.json');
  const index = categories.findIndex(c => c.id === Number(id));
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  categories[index] = { ...categories[index], ...body, id: Number(id) };
  writeData('categories.json', categories);
  return NextResponse.json(categories[index]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = readData<Category>('categories.json');
  const filtered = categories.filter(c => c.id !== Number(id));
  if (filtered.length === categories.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  writeData('categories.json', filtered);
  return NextResponse.json({ success: true });
}
