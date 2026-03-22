import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Visit {
  id: string;
  duration: number;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, duration } = body;
    if (!id || !duration) return NextResponse.json({ ok: false });

    const visits = readData<Visit>('analytics.json');
    const visit = visits.find((v) => v.id === id);
    if (visit) {
      visit.duration = Math.max(visit.duration || 0, duration);
      writeData('analytics.json', visits);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
