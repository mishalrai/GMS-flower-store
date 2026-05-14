import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const [products, salesGroups] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(category && category !== 'all' ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Aggregate units sold from delivered/processing orders. Excludes
    // cancelled and pending so "popular" reflects realised sales.
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: { status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] } },
      },
    }),
  ]);

  const salesByProduct = new Map<number, number>(
    salesGroups.map((g) => [g.productId, g._sum.quantity ?? 0]),
  );

  const withSales = products.map((p) => ({
    ...p,
    salesCount: salesByProduct.get(p.id) ?? 0,
  }));

  return NextResponse.json(withSales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug =
    body.slug ||
    body.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  // Use max ID to avoid collisions with seeded data gaps
  const maxId = await prisma.product.aggregate({ _max: { id: true } });
  const nextNum = (maxId._max.id ?? 0) + 1;
  const sku = body.sku || `GMS-${String(nextNum).padStart(4, '0')}`;

  const product = await prisma.product.create({
    data: {
      sku,
      name: body.name,
      slug,
      category: body.category,
      price: body.price,
      salePrice: body.salePrice ?? null,
      costPrice: body.costPrice ?? null,
      image: body.image ?? '',
      images: body.images ?? [],
      videos: body.videos ?? [],
      description: body.description ?? '',
      size: body.size ?? 'small',
      badge: body.badge ?? null,
      rating: body.rating ?? 0,
      inStock: body.inStock ?? true,
      inventory: body.inventory ?? null,
      richText: body.richText ?? null,
      tags: body.tags ?? [],
    },
  });

  return NextResponse.json(product, { status: 201 });
}
