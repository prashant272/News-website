import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.primetimemedia.in';
        const response = await fetch(`${apiUrl}/sitemap-news.xml`, {
            next: { revalidate: 600 } // Cache for 10 minutes (News sitemap should be fresher)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch news sitemap from backend');
        }

        const sitemapXml = await response.text();

        return new NextResponse(sitemapXml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('News Sitemap proxy error:', error);
        return new NextResponse('Error generating news sitemap', { status: 500 });
    }
}
