import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

function formatOrder(order: Awaited<ReturnType<typeof prisma.order.findUnique>> & { items?: unknown[] }) {
  if (!order) return null;
  return {
    id: order.id,
    status: order.status,
    reviewEnabled: order.reviewEnabled,
    total: order.total,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      address: order.customerAddress,
      note: order.customerNote ?? undefined,
      ...(order.locationLat != null && order.locationLng != null
        ? { location: { lat: order.locationLat, lng: order.locationLng } }
        : {}),
    },
    payment: {
      method: order.paymentMethod,
      ...(order.paymentQrLabel ? { qrLabel: order.paymentQrLabel } : {}),
      ...(order.paymentScreenshot ? { screenshotUrl: order.paymentScreenshot } : {}),
    },
    items: (order.items as { id: number; productId: number; name: string; quantity: number; price: number; reviewed: boolean; product?: { image: string; slug: string } | null }[] | undefined)?.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      reviewed: item.reviewed,
      image: item.product?.image ?? null,
      slug: item.product?.slug ?? null,
    })) ?? [],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { image: true, slug: true } } } } },
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(formatOrder(order));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        // Auto-enable reviews when delivered
        ...(body.status === 'delivered' && { reviewEnabled: true }),
        ...(body.reviewEnabled !== undefined && body.status !== 'delivered' && { reviewEnabled: body.reviewEnabled }),
        // Update individual item reviewed flags if provided
        ...(body.items !== undefined && {
          items: {
            updateMany: body.items
              .filter((item: { productId?: number; reviewed?: boolean }) => item.productId !== undefined)
              .map((item: { productId: number; reviewed: boolean }) => ({
                where: { productId: item.productId },
                data: { reviewed: item.reviewed },
              })),
          },
        }),
      },
      include: { items: { include: { product: { select: { image: true, slug: true } } } } },
    });
    return NextResponse.json(formatOrder(order));
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
