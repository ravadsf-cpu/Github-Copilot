import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder: later call aggregator
  const demo = [
    { id: '1', title: 'Breaking: Market Rally Continues', url: '#', description: 'Stocks surge as inflation cools', lean: 'CENTER' },
    { id: '2', title: 'Policy Update: New Regulations', url: '#', description: 'Government announces compliance changes', lean: 'LEFT' },
    { id: '3', title: 'Tech: AI Advances', url: '#', description: 'Startups release new LLM features', lean: 'RIGHT' }
  ];
  return NextResponse.json(demo);
}
