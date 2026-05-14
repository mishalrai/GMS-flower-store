import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { optimizeImage } from '@/lib/optimize-image';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');

  const media = await prisma.media.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { originalName: { contains: search, mode: 'insensitive' } },
              { alt: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(type && type !== 'all' ? { type: { startsWith: type } } : {}),
    },
    orderBy: { uploadedAt: 'desc' },
  });

  return NextResponse.json(media);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const uploaded = [];

  for (const file of files) {
    const isVideo = file.type.startsWith('video/');
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    // Images go through the optimizer; videos are saved as-is.
    let buffer: Buffer;
    let finalSize: number;
    if (isVideo) {
      buffer = rawBuffer;
      finalSize = rawBuffer.length;
    } else {
      const opt = await optimizeImage(rawBuffer, file.type);
      buffer = opt.buffer;
      finalSize = opt.optimizedSize;
    }

    const ext = path.extname(file.name) || (isVideo ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);

    const item = await prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url: `/uploads/${filename}`,
        size: finalSize,
        type: file.type,
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      },
    });

    uploaded.push(item);
  }

  return NextResponse.json(uploaded, { status: 201 });
}
