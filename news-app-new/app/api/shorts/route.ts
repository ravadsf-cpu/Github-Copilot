import { NextResponse } from 'next/server';

export async function GET() {
  const demo = [
    { id: 's1', title: 'Short: Election Night Highlights', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 's2', title: 'Short: Mars Mission Update', videoUrl: 'https://www.w3schools.com/html/movie.mp4' }
  ];
  return NextResponse.json(demo);
}
