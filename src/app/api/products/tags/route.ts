import { NextResponse } from 'next/server';
import { readData } from '@/lib/db';

interface Product {
  tags?: string[];
  [key: string]: unknown;
}

export async function GET() {
  const products = readData<Product>('products.json');
  const tagSet = new Set<string>();
  products.forEach((p) => {
    if (p.tags) p.tags.forEach((t) => tagSet.add(t));
  });
  return NextResponse.json([...tagSet].sort());
}
