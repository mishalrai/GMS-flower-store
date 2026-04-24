import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const media = await prisma.media.update({
      where: { id: Number(id) },
      data: {
        ...(body.alt !== undefined && { alt: body.alt }),
        ...(body.originalName !== undefined && { originalName: body.originalName }),
      },
    });
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.media.findUnique({ where: { id: Number(id) } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Validate path stays within uploads directory before deleting
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsDir, item.filename);
  if (filePath.startsWith(uploadsDir)) {
    try {
      await unlink(filePath);
    } catch {
      // File already gone — continue
    }
  }

  await prisma.media.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
