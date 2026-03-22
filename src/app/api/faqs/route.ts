import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export async function GET() {
  const faqs = readData<FAQ>('faqs.json');
  return NextResponse.json(faqs.sort((a, b) => a.order - b.order));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const faqs = readData<FAQ>('faqs.json');
  const maxId = faqs.reduce((max, f) => Math.max(max, f.id), 0);
  const maxOrder = faqs.reduce((max, f) => Math.max(max, f.order), 0);
  const newFaq: FAQ = {
    id: maxId + 1,
    question: body.question,
    answer: body.answer,
    order: maxOrder + 1,
    active: true,
  };
  faqs.push(newFaq);
  writeData('faqs.json', faqs);
  return NextResponse.json(newFaq, { status: 201 });
}
