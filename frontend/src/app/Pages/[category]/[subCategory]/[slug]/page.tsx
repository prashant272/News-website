import { notFound } from 'next/navigation';
import { newsService, NewsItem } from '@/app/services/NewsService';
import ArticlePageClient from '@/app/Components/ArticlePage/ArticlePageClient/ArticlePageClient';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    category: string;
    subCategory: string;
    slug: string;
  }>;
}

const siteUrl = "https://www.primetimemedia.in";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params;

  try {
    const sectionKey = decodeURIComponent(category).toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    const res = await newsService.getNewsBySlug(sectionKey, slug);
    const news = res.news || res.data;

    if (news) {
      let imageUrl = news.image || '/placeholder.jpg';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      const descriptionSnippet = news.summary || news.content?.substring(0, 150) || "";
      const fullDescription = `${descriptionSnippet.replace(/[#*]/g, '')}... | Click to read full news and view more updates on Prime Time Media`;

      const { subCategory } = await params;
      const articleUrl = `${siteUrl}/Pages/${category}/${subCategory}/${slug}`;

      return {
        metadataBase: new URL(siteUrl),
        title: news.title,
        description: fullDescription,
        openGraph: {
          title: news.title,
          description: fullDescription,
          url: articleUrl,
          siteName: 'Prime Time News',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: news.title,
            },
          ],
          type: 'article',
          publishedTime: news.publishedAt || (news as any).createdAt,
        },
        twitter: {
          card: 'summary_large_image',
          title: news.title,
          description: fullDescription,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Metadata generation error:", error);
  }

  return {
    metadataBase: new URL(siteUrl),
    title: "News | Prime Time News",
    description: "Latest breaking news and updates on Prime Time Media."
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { category: catParam, subCategory: subCatParam, slug } = await params;

  const category = decodeURIComponent(catParam).toLowerCase().replace(/-/g, ' ');
  const subCategory = decodeURIComponent(subCatParam).toLowerCase().replace(/-/g, ' ');
  const sectionKey = category.replace(/\s+/g, '');

  try {
    // 1. Try fetching specifically by slug and section first (Fastest)
    const newsRes = await newsService.getNewsBySlug(sectionKey, slug);
    let foundArticle = newsRes.news || newsRes.data;

    let relatedNews: NewsItem[] = [];

    if (foundArticle) {
      // Fetch only the relevant section for sidebar
      const sectionRes = await newsService.getNewsBySection(sectionKey);
      relatedNews = (sectionRes.news || sectionRes.data || []) as NewsItem[];
    } else {
      // 2. Fallback: search in all news if not found in primary section
      const allNewsRes = await newsService.getAllNews();
      const allDocs: any[] = (allNewsRes as any).news || allNewsRes.data || [];

      const allNews: NewsItem[] = [];
      const sections = ['india', 'sports', 'business', 'lifestyle', 'entertainment', 'health', 'awards', 'technology', 'world'];

      allDocs.forEach(doc => {
        sections.forEach(sec => {
          if (doc[sec] && Array.isArray(doc[sec])) {
            doc[sec].forEach((item: any) => {
              allNews.push({ ...item, category: sec });
            });
          }
        });
      });

      foundArticle = allNews.find(n => n.slug === slug);
      if (!foundArticle) notFound();

      // Use items from the article's actual category for related stories
      relatedNews = allNews.filter(n => n.category === foundArticle.category);
    }

    return renderArticle(foundArticle!, relatedNews, category, subCategory, slug);

  } catch (error) {
    console.error("Article Detail server-side error:", error);
    notFound();
  }
}

function renderArticle(foundArticle: any, categoryNews: any[], category: string, subCategory: string, slug: string) {
  const articleData = {
    id: foundArticle._id || foundArticle.slug,
    section: foundArticle.category || category,
    category: foundArticle.subCategory || subCategory,
    title: foundArticle.title,
    subtitle: foundArticle.summary || '',
    image: foundArticle.image || '/placeholder.jpg',
    date: foundArticle.publishedAt || foundArticle.createdAt || new Date().toISOString(),
    author: 'News Desk',
    readTime: '5 min read',
    content: foundArticle.content || 'Content not available',
    tags: foundArticle.tags || [],
    slug: foundArticle.slug,
    targetLink: foundArticle.targetLink,
    nominationLink: foundArticle.nominationLink
  };

  // Filter related articles from the provided category stories
  const related = categoryNews
    .filter((news: any) => news.slug !== slug)
    .slice(0, 3)
    .map((news: any) => ({
      id: news._id || news.slug,
      title: news.title,
      slug: news.slug,
      section: news.category,
      category: news.subCategory,
      image: news.image
    }));

  const topNews = categoryNews.slice(0, 2).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    image: news.image || '/placeholder.jpg',
    slug: news.slug,
    section: news.category || '',
    category: news.subCategory || ''
  }));

  const recommendedStories = categoryNews.slice(2, 7).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    image: news.image || '/placeholder.jpg',
    slug: news.slug,
    section: news.category || '',
    category: news.subCategory || ''
  }));

  return (
    <ArticlePageClient
      article={articleData}
      relatedArticles={related}
      topNews={topNews}
      recommendedStories={recommendedStories}
      section={category}
      category={subCategory}
    />
  );
}
