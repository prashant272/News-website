import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const headerList = await headers();
        const host = headerList.get("host") || "";
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.primetimemedia.in';
        // Append host as query param to ensure unique cache keys if ever cached,
        // and disable Next.js fetch caching so we don't serve old invalid XMLs
        const response = await fetch(`${apiUrl}/sitemap.xml?domain=${host}`, {
            headers: {
                'X-Forwarded-Host': host
            },
            cache: 'no-store'
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
