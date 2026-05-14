import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const slug = (body.slug || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (!slug || !body.title) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
  }

  const page = await prisma.page.create({
    data: {
      slug,
      title: body.title,
      blocks: body.blocks ?? [],
      published: body.published ?? true,
    },
  });

  return NextResponse.json(page, { status: 201 });
}
