import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import prisma from '@/lib/db';
import { optimizeImage } from '@/lib/optimize-image';

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
  const filename = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      url,
      size: optimizedSize,
      type: file.type,
      alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    },
  });

  return NextResponse.json({ url });
}
