import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const slug =
    body.slug ||
    body.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug,
      image: body.image ?? '',
      description: body.description ?? '',
    },
  });

  return NextResponse.json(category, { status: 201 });
}
