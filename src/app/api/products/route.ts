import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
  description: string;
  size: string;
  badge: string | null;
  rating: number;
  inStock: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let products = readData<Product>('products.json');

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q));
  }

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const products = readData<Product>('products.json');

  const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
  const newProduct: Product = {
    ...body,
    id: maxId + 1,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  };

  products.push(newProduct);
  writeData('products.json', products);
  return NextResponse.json(newProduct, { status: 201 });
}
