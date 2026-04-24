import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const products = await prisma.product.findMany({ select: { tags: true } });
  const tagSet = new Set<string>();
  products.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return NextResponse.json([...tagSet].sort());
}
