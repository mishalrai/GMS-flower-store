import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const media = readData<MediaItem>('media.json');
  const index = media.findIndex((m) => m.id === Number(id));

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  media[index] = { ...media[index], ...body, id: media[index].id };
  writeData('media.json', media);

  return NextResponse.json(media[index]);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const media = readData<MediaItem>('media.json');
  const item = media.find((m) => m.id === Number(id));

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Delete the file from disk
  try {
    const filepath = path.join(process.cwd(), 'public', item.url);
    await unlink(filepath);
  } catch {
    // File may already be gone
  }

  const updated = media.filter((m) => m.id !== Number(id));
  writeData('media.json', updated);

  return NextResponse.json({ success: true });
}
