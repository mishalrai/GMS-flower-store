import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

const SYSTEM_SLUGS = new Set(["home", "about", "contact"]);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.blocks !== undefined) data.blocks = body.blocks;
  if (body.published !== undefined) data.published = body.published;

  try {
    const page = await prisma.page.update({ where: { slug }, data });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (SYSTEM_SLUGS.has(slug)) {
    return NextResponse.json({ error: "System pages cannot be deleted" }, { status: 403 });
  }

  try {
    await prisma.page.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
}
