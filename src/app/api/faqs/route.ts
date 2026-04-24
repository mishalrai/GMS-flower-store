import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json(faqs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const maxOrder = await prisma.faq.aggregate({ _max: { order: true } });
  const faq = await prisma.faq.create({
    data: {
      question: body.question,
      answer: body.answer,
      order: (maxOrder._max.order ?? 0) + 1,
      active: true,
    },
  });
  return NextResponse.json(faq, { status: 201 });
}
