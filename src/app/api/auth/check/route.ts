import { verifyToken, getAuthCookie } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const token = await getAuthCookie();
  if (token && await verifyToken(token)) {
    return NextResponse.json({ isAdmin: true });
  }
  return NextResponse.json({ isAdmin: false });
}
