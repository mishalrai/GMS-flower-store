import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Shape DB row → frontend-compatible order object
function formatOrder(order: Awaited<ReturnType<typeof prisma.order.findFirst>> & { items?: unknown[] }) {
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
    items: (order.items as { id: number; productId: number; name: string; quantity: number; price: number; reviewed: boolean }[] | undefined)?.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      reviewed: item.reviewed,
    })) ?? [],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const phone = searchParams.get('phone');

  const orders = await prisma.order.findMany({
    where: {
      ...(status && status !== 'all' ? { status: status as never } : {}),
      ...(phone ? { customerPhone: phone } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders.map(formatOrder));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Find highest existing order number to avoid collisions
  const lastOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  const lastNum = lastOrder ? parseInt(lastOrder.id.replace('ORD-', ''), 10) : 0;
  const orderId = `ORD-${String(lastNum + 1).padStart(3, '0')}`;

  const order = await prisma.order.create({
    data: {
      id: orderId,
      status: 'pending',
      reviewEnabled: false,
      total: body.total ?? 0,
      customerName: body.customer?.name ?? '',
      customerPhone: body.customer?.phone ?? '',
      customerAddress: body.customer?.address ?? '',
      customerNote: body.customer?.note ?? null,
      locationLat: body.customer?.location?.lat ?? null,
      locationLng: body.customer?.location?.lng ?? null,
      paymentMethod: body.payment?.method === 'qr' ? 'qr' : 'cod',
      paymentQrLabel: body.payment?.qrLabel ?? null,
      paymentScreenshot: body.payment?.screenshotUrl ?? null,
      items: {
        create: (body.items ?? []).map((item: { productId: number; name: string; quantity: number; price: number }) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          reviewed: false,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(formatOrder(order), { status: 201 });
}
