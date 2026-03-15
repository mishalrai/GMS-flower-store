import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const media = readData<MediaItem>('media.json');
  const index = media.findIndex((m) => m.id === Number(id));

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const rawBuffer = Buffer.from(bytes);
  const { buffer, optimizedSize } = await optimizeImage(rawBuffer, file.type);

  // Save as new file
  const ext = path.extname(media[index].filename) || '.jpg';
  const filename = `${Date.now()}-crop-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  // Update media record
  media[index] = {
    ...media[index],
    filename,
    url: `/uploads/${filename}`,
    size: optimizedSize,
    type: file.type || media[index].type,
  };

  writeData('media.json', media);

  return NextResponse.json(media[index]);
}
