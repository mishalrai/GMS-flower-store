import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { optimizeImage } from '@/lib/optimize-image';

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  alt: string;
  uploadedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');

  let media = readData<MediaItem>('media.json');

  // Sort newest first
  media.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  if (search) {
    const q = search.toLowerCase();
    media = media.filter(
      (m) =>
        m.originalName.toLowerCase().includes(q) ||
        m.alt.toLowerCase().includes(q)
    );
  }

  if (type && type !== 'all') {
    media = media.filter((m) => m.type.startsWith(type));
  }

  return NextResponse.json(media);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const media = readData<MediaItem>('media.json');
  const maxId = media.reduce((max, m) => Math.max(max, m.id), 0);
  const uploaded: MediaItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    const { buffer, optimizedSize } = await optimizeImage(rawBuffer, file.type);

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);

    const item: MediaItem = {
      id: maxId + 1 + i,
      filename,
      originalName: file.name,
      url: `/uploads/${filename}`,
      size: optimizedSize,
      type: file.type,
      alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      uploadedAt: new Date().toISOString(),
    };

    uploaded.push(item);
  }

  media.push(...uploaded);
  writeData('media.json', media);

  return NextResponse.json(uploaded, { status: 201 });
}
