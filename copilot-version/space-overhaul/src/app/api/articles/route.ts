import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fresh = searchParams.get('fresh') === 'true';

        // In a real app, if fresh=true, we might fetch from external APIs here
        // For now, we return what's in the DB

        const articles = await prisma.article.findMany({
            orderBy: { publishedAt: 'desc' },
            take: 20,
        });

        return NextResponse.json(articles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const article = await prisma.article.create({
            data: {
                title: body.title,
                snippet: body.snippet,
                content: body.content,
                url: body.url,
                source: body.source,
                publishedAt: new Date(),
                leaning: body.leaning || 'CENTER',
            },
        });
        return NextResponse.json(article);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}
