import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface Visit {
  id: string;
  timestamp: string;
  page: string;
  referrer: string;
  ip: string;
  country: string;
  city: string;
  region: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  lat: number | null;
  lng: number | null;
  duration: number;
}

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

  // OS detection
  if (ua.includes('Windows NT')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device detection
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) device = 'Mobile';
  else if (ua.includes('iPad') || ua.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';
    const ua = request.headers.get('user-agent') || '';
    const { browser, os, device } = parseUserAgent(ua);

    // Geo: prefer client-side geo (from ipapi.co), fallback to server-side IP lookup
    let country = body.geoCountry || 'Unknown';
    let city = body.geoCity || 'Unknown';
    let region = body.geoRegion || 'Unknown';
    const realIP = body.geoIP || ip;

    if (country === 'Unknown') {
      try {
        if (realIP !== '127.0.0.1' && realIP !== '::1') {
          const geo = await fetch(`http://ip-api.com/json/${realIP}?fields=country,city,regionName`, {
            signal: AbortSignal.timeout(2000),
          });
          if (geo.ok) {
            const d = await geo.json();
            country = d.country || 'Unknown';
            city = d.city || 'Unknown';
            region = d.regionName || 'Unknown';
          }
        }
      } catch {
        // geo lookup failed
      }
    }

    const visit: Visit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      page: body.page || '/',
      referrer: body.referrer || '',
      ip: realIP,
      country,
      city,
      region,
      userAgent: ua,
      browser,
      os,
      device,
      screenWidth: body.screenWidth || 0,
      screenHeight: body.screenHeight || 0,
      language: body.language || '',
      lat: body.lat || null,
      lng: body.lng || null,
      duration: 0,
    };

    const visits = readData<Visit>('analytics.json');
    visits.push(visit);

    // Keep last 10,000 visits
    const trimmed = visits.length > 10000 ? visits.slice(-10000) : visits;
    writeData('analytics.json', trimmed);

    return NextResponse.json({ ok: true, id: visit.id });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
