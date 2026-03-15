import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Category { id: number; name: string; slug: string; image: string; description: string; }

export async function GET() {
  return NextResponse.json(readData<Category>('categories.json'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const categories = readData<Category>('categories.json');
  const maxId = categories.reduce((max, c) => Math.max(max, c.id), 0);
  const newCategory: Category = {
    ...body,
    id: maxId + 1,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  };
  categories.push(newCategory);
  writeData('categories.json', categories);
  return NextResponse.json(newCategory, { status: 201 });
}
