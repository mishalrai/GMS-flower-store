import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const presets = await prisma.faqPreset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(presets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const faqIds = Array.isArray(body.faqIds)
    ? body.faqIds.filter((n: unknown): n is number => typeof n === "number")
    : [];
  const preset = await prisma.faqPreset.create({
    data: {
      name: body.name.trim(),
      title: typeof body.title === "string" ? body.title : null,
      subtitle: typeof body.subtitle === "string" ? body.subtitle : null,
      faqIds,
    },
  });
  return NextResponse.json(preset, { status: 201 });
}
