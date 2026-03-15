import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Product {
  id: number;
  [key: string]: unknown;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = readData<Product>('products.json');
  const product = products.find(p => p.id === Number(id));
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const products = readData<Product>('products.json');
  const index = products.findIndex(p => p.id === Number(id));
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  products[index] = { ...products[index], ...body, id: Number(id) };
  writeData('products.json', products);
  return NextResponse.json(products[index]);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = readData<Product>('products.json');
  const filtered = products.filter(p => p.id !== Number(id));
  if (filtered.length === products.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  writeData('products.json', filtered);
  return NextResponse.json({ success: true });
}
