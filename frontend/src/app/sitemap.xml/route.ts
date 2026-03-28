import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.primetimemedia.in';
        const response = await fetch(`${apiUrl}/sitemap.xml`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sitemap from backend');
        }

        const sitemapXml = await response.text();

        return new NextResponse(sitemapXml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Sitemap proxy error:', error);
        return new NextResponse('Error generating sitemap', { status: 500 });
    }
}
