import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Review {
  id: string;
  productId: number;
  productName: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  text: string;
  createdAt: string;
}

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  let reviews = readData<Review>('reviews.json');
  if (productId) reviews = reviews.filter(r => r.productId === Number(productId));

  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { productId, phone, rating, text } = body;

  // Validate: find orders for this phone that contain this product and have reviewEnabled
  const orders = readData<Order>('orders.json');
  const eligibleOrder = orders.find(o =>
    o.customer.phone === phone &&
    o.reviewEnabled &&
    o.items.some(item => item.productId === productId && !item.reviewed)
  );

  if (!eligibleOrder) {
    return NextResponse.json({
      error: 'You are not eligible to review this product. Reviews are available after your order is delivered.'
    }, { status: 403 });
  }

  const item = eligibleOrder.items.find(i => i.productId === productId);
  if (!item) {
    return NextResponse.json({ error: 'Product not found in order' }, { status: 404 });
  }

  // Create review
  const reviews = readData<Review>('reviews.json');
  const count = reviews.length + 1;
  const newReview: Review = {
    id: `REV-${String(count).padStart(3, '0')}`,
    productId,
    productName: item.name,
    orderId: eligibleOrder.id,
    customerName: eligibleOrder.customer.name,
    customerPhone: phone,
    rating,
    text,
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);
  writeData('reviews.json', reviews);

  // Mark item as reviewed in order
  item.reviewed = true;
  writeData('orders.json', orders);

  return NextResponse.json(newReview, { status: 201 });
}
