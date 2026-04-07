import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const host = headersList.get('host') || 'www.primetimemedia.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/Dashboard/', 
                '/api/', 
                '/_next/',
                '/admin/',
                '/login/',
                '/auth/',
                '/*.php',    // Block old PHP pages
                '/*.html',   // Block old HTML pages (Next.js is dynamic)
                '/wp-admin/', // Just in case it was WordPress
                '/cgi-bin/',
                '/temp/'
            ],
        },
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/sitemap-news.xml`
        ],
    };
}
