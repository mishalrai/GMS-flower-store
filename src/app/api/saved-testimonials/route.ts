import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const items = await prisma.savedTestimonial.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name || !body.text) {
    return NextResponse.json(
      { error: "name and text are required" },
      { status: 400 },
    );
  }
  const item = await prisma.savedTestimonial.create({
    data: {
      name: String(body.name),
      location: body.location ? String(body.location) : null,
      text: String(body.text),
      rating: typeof body.rating === "number" ? body.rating : 5,
      image: body.image ? String(body.image) : null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
