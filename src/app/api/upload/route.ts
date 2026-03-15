import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { readData, writeData } from '@/lib/db';
import { optimizeImage } from '@/lib/optimize-image';

interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  alt: string;
  uploadedAt: string;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const rawBuffer = Buffer.from(bytes);

  const { buffer, optimizedSize } = await optimizeImage(rawBuffer, file.type);

  const ext = path.extname(file.name) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  // Register in media library
  const media = readData<MediaItem>('media.json');
  const maxId = media.reduce((max, m) => Math.max(max, m.id), 0);
  const item: MediaItem = {
    id: maxId + 1,
    filename,
    originalName: file.name,
    url,
    size: optimizedSize,
    type: file.type,
    alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    uploadedAt: new Date().toISOString(),
  };
  media.push(item);
  writeData('media.json', media);

  return NextResponse.json({ url });
}
