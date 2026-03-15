import { NextRequest, NextResponse } from 'next/server';
import { readSingle, writeSingle } from '@/lib/db';

interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  freeDeliveryThreshold: number;
  currency: string;
  socialLinks: { facebook: string; instagram: string };
}

export async function GET() {
  const settings = readSingle<StoreSettings>('settings.json');
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  writeSingle('settings.json', body);
  return NextResponse.json(body);
}
