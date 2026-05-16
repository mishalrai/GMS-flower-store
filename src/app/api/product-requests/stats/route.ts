import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Top requested products by demand. Groups by the normalized slug so different
// casings/spellings of the same product roll up together. For each group we
// return a sample name/description (the most recent request) so the admin UI
// can show something readable without an extra query per row.
export async function GET() {
  const grouped = await prisma.productRequest.groupBy({
    by: ["productSlug"],
    _count: { productSlug: true },
    orderBy: { _count: { productSlug: "desc" } },
    take: 50,
  });

  const topSlugs = grouped.map((g) => g.productSlug);
  if (topSlugs.length === 0) return NextResponse.json([]);

  const latestPerSlug = await prisma.productRequest.findMany({
    where: { productSlug: { in: topSlugs } },
    orderBy: { createdAt: "desc" },
  });

  const sampleBySlug = new Map<string, (typeof latestPerSlug)[number]>();
  for (const r of latestPerSlug) {
    if (!sampleBySlug.has(r.productSlug)) sampleBySlug.set(r.productSlug, r);
  }

  const stats = grouped.map((g) => {
    const sample = sampleBySlug.get(g.productSlug);
    return {
      productSlug: g.productSlug,
      productName: sample?.productName ?? g.productSlug,
      latestStatus: sample?.status ?? "pending",
      latestRequestAt: sample?.createdAt ?? null,
      count: g._count.productSlug,
    };
  });

  return NextResponse.json(stats);
}
