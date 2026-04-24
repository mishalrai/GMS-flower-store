import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const count = await prisma.banner.count();
  const banner = await prisma.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? '',
      buttonText: body.buttonText ?? '',
      buttonLink: body.buttonLink ?? '',
      image: body.image ?? '',
      order: count,
    },
  });
  return NextResponse.json(banner, { status: 201 });
}
