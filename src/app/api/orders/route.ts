import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface OrderItem { productId: number; name: string; quantity: number; price: number; reviewed: boolean; }
interface Payment { method: 'cod' | 'qr'; qrLabel?: string; screenshotUrl?: string; }
interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string; note?: string; location?: { lat: number; lng: number } };
  payment: Payment;
  status: string;
  reviewEnabled: boolean;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const phone = searchParams.get('phone');

  let orders = readData<Order>('orders.json');
  if (status && status !== 'all') orders = orders.filter(o => o.status === status);
  if (phone) orders = orders.filter(o => o.customer.phone === phone);

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orders = readData<Order>('orders.json');
  const count = orders.length + 1;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ORD-${String(count).padStart(3, '0')}`,
    items: (body.items || []).map((item: Partial<OrderItem>) => ({ ...item, reviewed: false })),
    customer: body.customer,
    payment: body.payment || { method: 'cod' },
    status: 'pending',
    reviewEnabled: false,
    total: body.total || 0,
    createdAt: now,
    updatedAt: now,
  };

  orders.push(newOrder);
  writeData('orders.json', orders);
  return NextResponse.json(newOrder, { status: 201 });
}
