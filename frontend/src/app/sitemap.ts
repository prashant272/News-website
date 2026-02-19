import { MetadataRoute } from 'next';
import { newsService } from './services/NewsService';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.primetimemedia.in';

    // Static routes
    const routes = [
        '',
        '/Values',
        '/Vision',
        '/WhoWeAre',
        '/Management',
        '/Contact',
        '/disclaimer',
        '/privacy',
        '/terms',
        '/Pages/india',
        '/Pages/world',
        '/Pages/business',
        '/Pages/technology',
        '/Pages/entertainment',
        '/Pages/sports',
        '/Pages/science',
        '/Pages/health',
        '/Pages/lifestyle',
        '/Pages/education',
        '/Pages/environment',
        '/Pages/auto',
        '/Pages/travel',
        '/Pages/awards',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes (News Articles)
    const newsRoutes: MetadataRoute.Sitemap = [];
    try {
        const allNewsRes = await newsService.getAllNews();
        // Handle potential different response structures
        const allDocs: any[] = (allNewsRes as any).news || allNewsRes.data || [];
        const sections = ['india', 'sports', 'business', 'lifestyle', 'entertainment', 'health', 'awards', 'technology', 'world', 'education', 'environment', 'science', 'auto', 'travel'];

        allDocs.forEach(doc => {
            sections.forEach(sec => {
                if (doc[sec] && Array.isArray(doc[sec])) {
                    doc[sec].forEach((item: any) => {
                        // Ensure we have a slug. Use the section as category.
                        if (item.slug) {
                            // Clean and encode subCategory (e.g., "Business & Finance" -> "business-finance" or "Business%20%26%20Finance")
                            const subCat = (item.subCategory || 'General')
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphen
                                .replace(/(^-|-$)+/g, ''); // Trim hyphens

                            const cat = sec;

                            // Assuming item.slug is already a slug, but sanitize just in case
                            const safeSlug = item.slug
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/(^-|-$)+/g, '');

                            newsRoutes.push({
                                url: `${baseUrl}/Pages/${cat}/${encodeURIComponent(subCat)}/${encodeURIComponent(safeSlug)}`,
                                lastModified: item.publishedAt || item.createdAt || new Date(),
                                changeFrequency: 'weekly',
                                priority: 0.6
                            });
                        }
                    });
                }
            });
        });

    } catch (error) {
        console.error("Sitemap generation error:", error);
    }

    return [...routes, ...newsRoutes];
}
