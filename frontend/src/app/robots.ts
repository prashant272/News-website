import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
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
            'https://www.primetimemedia.in/sitemap.xml',
            'https://www.primetimemedia.in/sitemap-news.xml'
        ],
    };
}
