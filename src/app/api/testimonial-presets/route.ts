import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const presets = await prisma.testimonialPreset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(presets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const source = body.source === "manual" ? "manual" : "reviews";
  const manual = Array.isArray(body.manual) ? body.manual : [];
  const preset = await prisma.testimonialPreset.create({
    data: {
      name: body.name.trim(),
      title: typeof body.title === "string" ? body.title : null,
      source,
      limit: typeof body.limit === "number" ? body.limit : null,
      manual,
    },
  });
  return NextResponse.json(preset, { status: 201 });
}
