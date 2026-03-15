import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface OrderItem { productId: number; name: string; quantity: number; price: number; reviewed: boolean; }
interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string; note?: string };
  status: string;
  reviewEnabled: boolean;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = readData<Order>('orders.json');
  const order = orders.find(o => o.id === id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const orders = readData<Order>('orders.json');
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Auto-enable reviews when status changes to delivered
  const updatedOrder = { ...orders[index], ...body, updatedAt: new Date().toISOString() };
  if (body.status === 'delivered') {
    updatedOrder.reviewEnabled = true;
  }

  orders[index] = updatedOrder;
  writeData('orders.json', orders);
  return NextResponse.json(orders[index]);
}
