import { notFound } from 'next/navigation';
import { newsService, NewsItem } from '@/app/hooks/NewsApi';
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
    const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');
    const res = await newsService.getNewsBySlug(decodedCategory, slug);
    const news = res.news || res.data;

    if (news) {
      let imageUrl = news.image || '/placeholder.jpg';
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }

      const descriptionSnippet = news.summary || news.content?.substring(0, 150) || "";
      const fullDescription = `${descriptionSnippet.replace(/[#*]/g, '')}... | Click to read full news and view more updates on Prime Time Media`;

      return {
        metadataBase: new URL(siteUrl),
        title: news.title,
        description: fullDescription,
        openGraph: {
          title: news.title,
          description: fullDescription,
          url: `${siteUrl}/Pages/${category}/${(await params).subCategory}/${slug}`,
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

  const category = decodeURIComponent(catParam).replace(/-/g, ' ');
  const subCategory = decodeURIComponent(subCatParam).replace(/-/g, ' ');

  try {
    // Fetch all news to replicate the related/top news logic
    const allNewsRes = await newsService.getAllNews();
    const allNews: any[] = Array.isArray(allNewsRes.data) ? allNewsRes.data : [];

    // Find specific article
    const foundArticle = allNews.find((news) => news.slug === slug);

    if (!foundArticle) {
      notFound();
    }

    const articleData = {
      id: foundArticle._id || foundArticle.slug,
      section: foundArticle.category || category,
      category: foundArticle.subCategory || subCategory,
      title: foundArticle.title,
      subtitle: foundArticle.summary || '',
      image: foundArticle.image || '/placeholder.jpg',
      date: foundArticle.publishedAt || new Date().toISOString(),
      author: 'News Desk',
      readTime: '5 min read',
      content: foundArticle.content || 'Content not available',
      tags: foundArticle.tags || [],
      slug: foundArticle.slug,
      targetLink: foundArticle.targetLink,
      nominationLink: foundArticle.nominationLink
    };

    // Replicate sidebar and related logic
    const related = allNews
      .filter((news) =>
        news.category === foundArticle.category &&
        news.subCategory === foundArticle.subCategory &&
        news.slug !== slug
      )
      .slice(0, 3)
      .map((news) => ({
        id: news._id || news.slug,
        title: news.title,
        slug: news.slug,
        section: news.category,
        category: news.subCategory,
        image: news.image
      }));

    const categoryNews = allNews.filter((news) => news.category === foundArticle.category);

    const topNews = categoryNews.slice(0, 2).map((news) => ({
      id: news._id || news.slug,
      title: news.title,
      image: news.image || '/placeholder.jpg',
      slug: news.slug,
      section: news.category || '',
      category: news.subCategory || ''
    }));

    const recommendedStories = categoryNews.slice(2, 7).map((news) => ({
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

  } catch (error) {
    console.error("Article Detail server-side error:", error);
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Error loading article</h2>
        <p>Please try again later.</p>
      </div>
    );
  }
}
