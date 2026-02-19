import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/Dashboard/', '/api/', '/_next/'],
        },
        sitemap: 'https://www.primetimemedia.in/sitemap.xml',
    };
}
