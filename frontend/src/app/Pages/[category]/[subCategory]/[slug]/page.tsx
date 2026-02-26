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
    const sectionKey = category.toLowerCase();
    const res = await newsService.getNewsBySlug(sectionKey, slug).catch(() => null);
    if (!res) return { title: "News | Prime Time Media" };
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
  const sectionKey = catParam.toLowerCase(); // Use raw param for API

  try {
    // Fetch specifically by slug. The backend now finds by slug regardless of section mismatch.
    const newsRes = await newsService.getNewsBySlug(sectionKey, slug).catch(err => {
      console.warn(`Initial fetch failed for ${slug} in ${sectionKey}, trying fallback...`, err.message);
      return null;
    });

    let foundArticle = newsRes?.news || newsRes?.data;

    // If still not found, it might be a truly missing article or a draft
    if (!foundArticle) {
      notFound();
    }

    // Fetch related news from the same category
    const articleCategory = foundArticle.category || sectionKey;
    const sectionRes = await newsService.getNewsBySection(articleCategory).catch(() => ({ news: [], data: [] }));
    const relatedNews = ((sectionRes as any).news || (sectionRes as any).data || []) as NewsItem[];

    return renderArticle(foundArticle!, relatedNews, category, subCategory, slug);

  } catch (error) {
    console.error("Article Detail server-side error:", error);
    notFound();
  }
}

function renderArticle(foundArticle: any, categoryNews: any[], category: string, subCategory: string, slug: string) {
  console.log(`[DEBUG] Article ${slug} authorId:`, foundArticle.authorId);

  const articleData = {
    id: foundArticle._id || foundArticle.slug,
    section: foundArticle.category || category,
    category: foundArticle.subCategory || subCategory,
    title: foundArticle.title,
    subtitle: foundArticle.summary || '',
    image: foundArticle.image || '/placeholder.jpg',
    date: foundArticle.publishedAt || foundArticle.createdAt || new Date().toISOString(),
    author: foundArticle.author || 'Prime Time News',
    authorId: foundArticle.authorId,
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

  const topNews = categoryNews.slice(0, 10).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    image: news.image || '/placeholder.jpg',
    slug: news.slug,
    section: news.category || '',
    category: news.subCategory || ''
  }));

  const recommendedStories = categoryNews.slice(10, 15).map((news: any) => ({
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
