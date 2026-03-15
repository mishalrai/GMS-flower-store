import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Banner { id: number; title: string; subtitle: string; buttonText: string; buttonLink: string; image: string; }

export async function GET() {
  return NextResponse.json(readData<Banner>('banners.json'));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const banners = readData<Banner>('banners.json');
  const maxId = banners.reduce((max, b) => Math.max(max, b.id), 0);
  const newBanner: Banner = { ...body, id: maxId + 1 };
  banners.push(newBanner);
  writeData('banners.json', banners);
  return NextResponse.json(newBanner, { status: 201 });
}
