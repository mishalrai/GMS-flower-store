import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { optimizeImage } from '@/lib/optimize-image';

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

  const item = await prisma.media.findUnique({ where: { id: Number(id) } });
  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const rawBuffer = Buffer.from(bytes);
  const { buffer, optimizedSize } = await optimizeImage(rawBuffer, file.type);

  const ext = path.extname(item.filename) || '.jpg';
  const filename = `${Date.now()}-crop-${randomBytes(4).toString('hex')}${ext}`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  const updated = await prisma.media.update({
    where: { id: Number(id) },
    data: {
      filename,
      url: `/uploads/${filename}`,
      size: optimizedSize,
      type: file.type || item.type,
    },
  });

  return NextResponse.json(updated);
}
