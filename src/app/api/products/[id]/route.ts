import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.salePrice !== undefined && { salePrice: body.salePrice }),
        ...(body.costPrice !== undefined && { costPrice: body.costPrice }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.images !== undefined && { images: body.images }),
        ...(body.videos !== undefined && { videos: body.videos }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.size !== undefined && { size: body.size }),
        ...(body.badge !== undefined && { badge: body.badge }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.inStock !== undefined && { inStock: body.inStock }),
        ...(body.inventory !== undefined && { inventory: body.inventory }),
        ...(body.richText !== undefined && { richText: body.richText }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.sku !== undefined && { sku: body.sku }),
      },
    });
    return NextResponse.json(product);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    // Prisma "Record to update not found" → 404, anything else → 500 with detail
    if (msg.includes('not found') || msg.includes('No record')) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('PUT /api/products/[id] failed:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
