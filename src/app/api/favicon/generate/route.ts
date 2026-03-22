import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { readSingle, writeSingle } from '@/lib/db';

const FAVICON_DIR = join(process.cwd(), 'public', 'generated-icons');

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
];

export async function POST(request: NextRequest) {
  const { imageUrl } = await request.json();
  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
  }

  try {
    // Read the source image
    const imagePath = join(process.cwd(), 'public', imageUrl);
    const imageBuffer = readFileSync(imagePath);

    // Ensure output directory exists
    if (!existsSync(FAVICON_DIR)) {
      mkdirSync(FAVICON_DIR, { recursive: true });
    }

    // Generate all sizes
    for (const { name, size } of SIZES) {
      const resized = await sharp(imageBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      writeFileSync(join(FAVICON_DIR, name), resized);
    }

    // Generate ICO (16x16 and 32x32 PNGs embedded)
    const ico16 = await sharp(imageBuffer)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const ico32 = await sharp(imageBuffer)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // Build ICO file (simplified: single 32x32 PNG)
    const icoBuffer = buildIco([ico16, ico32]);
    writeFileSync(join(FAVICON_DIR, 'favicon.ico'), icoBuffer);

    // Update settings with favicon field
    const settings = readSingle<Record<string, unknown>>('settings.json') || {};
    settings.favicon = imageUrl;
    writeSingle('settings.json', settings);

    return NextResponse.json({
      success: true,
      icons: {
        ico: '/generated-icons/favicon.ico',
        '16': '/generated-icons/favicon-16x16.png',
        '32': '/generated-icons/favicon-32x32.png',
        apple: '/generated-icons/apple-touch-icon.png',
        '192': '/generated-icons/icon-192x192.png',
        '512': '/generated-icons/icon-512x512.png',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate favicons' }, { status: 500 });
  }
}

/** Build a minimal ICO file from PNG buffers */
function buildIco(pngs: Buffer[]): Buffer {
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * pngs.length;

  // ICO header: reserved(2) + type(2) + count(2)
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(pngs.length, 4); // image count

  const entries: Buffer[] = [];
  let offset = dataOffset;

  // Sizes corresponding to each PNG
  const sizes = [16, 32];

  for (let i = 0; i < pngs.length; i++) {
    const entry = Buffer.alloc(entrySize);
    const s = sizes[i] || 32;
    entry.writeUInt8(s >= 256 ? 0 : s, 0); // width (0 = 256)
    entry.writeUInt8(s >= 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2);  // color palette
    entry.writeUInt8(0, 3);  // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(pngs[i].length, 8); // data size
    entry.writeUInt32LE(offset, 12); // data offset
    entries.push(entry);
    offset += pngs[i].length;
  }

  return Buffer.concat([header, ...entries, ...pngs]);
}
