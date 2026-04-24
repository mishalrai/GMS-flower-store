import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  const reviews = await prisma.review.findMany({
    where: productId ? { productId: Number(productId) } : {},
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, phone, rating, text } = body;

  // Find eligible order: delivered (reviewEnabled), matching phone, unreviewed item
  const eligibleOrder = await prisma.order.findFirst({
    where: {
      customerPhone: phone,
      reviewEnabled: true,
      items: {
        some: { productId: Number(productId), reviewed: false },
      },
    },
    include: { items: true },
  });

  if (!eligibleOrder) {
    return NextResponse.json(
      { error: 'You are not eligible to review this product. Reviews are available after your order is delivered.' },
      { status: 403 }
    );
  }

  const item = eligibleOrder.items.find((i) => i.productId === Number(productId) && !i.reviewed);
  if (!item) {
    return NextResponse.json({ error: 'Product not found in order' }, { status: 404 });
  }

  const lastReview = await prisma.review.findFirst({ orderBy: { createdAt: 'desc' } });
  const lastRevNum = lastReview ? parseInt(lastReview.id.replace('REV-', ''), 10) : 0;
  const reviewId = `REV-${String(lastRevNum + 1).padStart(3, '0')}`;

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: {
        id: reviewId,
        productId: Number(productId),
        productName: item.name,
        orderId: eligibleOrder.id,
        customerName: eligibleOrder.customerName,
        customerPhone: phone,
        rating: Number(rating),
        text,
      },
    }),
    prisma.orderItem.update({
      where: { id: item.id },
      data: { reviewed: true },
    }),
  ]);

  return NextResponse.json(review, { status: 201 });
}
