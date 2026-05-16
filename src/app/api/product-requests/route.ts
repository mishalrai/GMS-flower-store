import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const requests = await prisma.productRequest.findMany({
    where: status && status !== "all" ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
  });

  // Annotate each request with the total count of rows sharing the same productSlug
  // so the admin UI can show demand ("requested 5×") without an extra round-trip.
  const counts = await prisma.productRequest.groupBy({
    by: ["productSlug"],
    _count: { productSlug: true },
  });
  const countBySlug = new Map(counts.map((c) => [c.productSlug, c._count.productSlug]));

  const annotated = requests.map((r) => ({
    ...r,
    requestCount: countBySlug.get(r.productSlug) ?? 1,
  }));

  return NextResponse.json(annotated);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const productName = String(body.productName || "").trim();
  const customerName = String(body.customerName || "").trim();
  const customerPhone = String(body.customerPhone || "").trim();
  const description = String(body.description || "").trim();

  if (!productName || !customerName || !customerPhone || !description) {
    return NextResponse.json(
      { error: "productName, customerName, customerPhone, and description are required" },
      { status: 400 },
    );
  }

  const created = await prisma.productRequest.create({
    data: {
      productName,
      productSlug: slugify(productName),
      description,
      customerName,
      customerPhone,
      customerEmail: body.customerEmail ? String(body.customerEmail).trim() : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
