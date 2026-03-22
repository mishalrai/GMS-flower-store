import { NextResponse } from 'next/server';
import { readSingle } from '@/lib/db';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const settings = readSingle<Record<string, unknown>>('settings.json');
  const storeName = (settings?.storeName as string) || 'GMS Flower Store';
  const hasFavicon = settings?.favicon && existsSync(join(process.cwd(), 'public', 'generated-icons', 'icon-192x192.png'));

  const manifest = {
    name: storeName,
    short_name: storeName,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6FB644',
    icons: hasFavicon
      ? [
          { src: '/generated-icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/generated-icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ]
      : [],
  };

  return NextResponse.json(manifest, {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
