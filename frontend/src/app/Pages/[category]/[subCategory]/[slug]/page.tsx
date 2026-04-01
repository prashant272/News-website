import { notFound } from 'next/navigation';
import { newsService, NewsItem } from '@/app/services/NewsService';
import ArticlePageClient from '@/app/Components/ArticlePage/ArticlePageClient/ArticlePageClient';
import HindiArticlePage from '@/app/Components/ArticlePage/HindiArticlePage/HindiArticlePage';
import { Metadata } from 'next';
import { getEnglishCategory, getHindiCategory } from '@/Utils/categoryMapping';

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
    const decodedCategory = decodeURIComponent(category || '');
    const sectionKey = getEnglishCategory(decodedCategory).toLowerCase();
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
        title: news.title,
        description: fullDescription,
        keywords: news.tags?.length > 0 ? news.tags.filter(Boolean) : ["Prime Time News", news.category || "", news.subCategory || ""],
        alternates: {
          canonical: articleUrl,
        },
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
  const sectionKey = getEnglishCategory(decodeURIComponent(catParam)).toLowerCase(); // Map back to English for API

  try {
    // 1. Fetch the specific article first to determine its language
    const newsRes = await newsService.getNewsBySlug(sectionKey, slug).catch(err => {
      console.warn(`Initial fetch failed for ${slug} in ${sectionKey}`, err.message);
      return null;
    });

    let foundArticle = newsRes?.news || newsRes?.data;

    // 2. If article not found, 404
    if (!foundArticle) {
      notFound();
    }

    // 3. Detect language from the article itself
    const articleLang = foundArticle.lang || foundArticle.language || 'en';

    // 4. Fetch related category news using the same language
    const sectionRes = await newsService.getNewsBySection(sectionKey, false, 1, 30, undefined, articleLang).catch(() => ({ news: [], data: [] }));

    const relatedNews = ((sectionRes as any).news || (sectionRes as any).data || []) as NewsItem[];

    // 3. Render
    return renderArticle(foundArticle!, relatedNews, category, subCategory, slug, sectionKey, articleLang);

  } catch (error) {
    console.error("Article Detail server-side error:", error);
    notFound();
  }
}

function renderArticle(foundArticle: any, categoryNews: any[], category: string, subCategory: string, slug: string, sectionKey: string, lang: string) {
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
    readTime: '',
    content: foundArticle.content || 'Content not available',
    tags: foundArticle.tags || [],
    slug: foundArticle.slug,
    targetLink: foundArticle.targetLink,
    nominationLink: foundArticle.nominationLink
  };

  // Filter related articles from the provided category stories and exclude current article
  const filteredCategoryNews = categoryNews
    .filter((news: any) => news.slug !== slug)
    // Ensure they are sorted by date descending (latest first)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.publishedAt || a.date || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.date || b.createdAt).getTime();
      return dateB - dateA;
    });

  // 1. Separate articles into subCategory matches and category-only matches
  const subCategoryMatches = filteredCategoryNews.filter((news: any) => 
    news.subCategory && foundArticle.subCategory && news.subCategory.toLowerCase() === foundArticle.subCategory.toLowerCase()
  );
  
  const categoryOnlyMatches = filteredCategoryNews.filter((news: any) => 
    !subCategoryMatches.find(sc => sc.slug === news.slug)
  );

  // 2. Combine them, prioritizing subCategory matches
  const prioritizedRelated = [...subCategoryMatches, ...categoryOnlyMatches];

  // 3. Take unique slices for "Also Read" (6 articles)
  const related = prioritizedRelated.slice(0, 16).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    slug: news.slug,
    section: news.category,
    category: news.subCategory,
    image: news.image,
    publishedAt: news.publishedAt || news.date || news.createdAt
  }));

  // Take the top 15 latest for the sidebar
  const topNews = filteredCategoryNews.slice(0, 15).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    image: news.image || '/placeholder.jpg',
    slug: news.slug,
    section: news.category || '',
    category: news.subCategory || ''
  }));

  // Take the next set of news for recommended stories (e.g., from index 15)
  const recommendedStories = filteredCategoryNews.slice(15, 20).map((news: any) => ({
    id: news._id || news.slug,
    title: news.title,
    image: news.image || '/placeholder.jpg',
    slug: news.slug,
    section: news.category || '',
    category: news.subCategory || ''
  }));

  // Prepare NewsArticle JSON-LD for Google News
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": articleData.title,
    "image": [articleData.image.startsWith('http') ? articleData.image : `${siteUrl}${articleData.image}`],
    "datePublished": articleData.date,
    "dateModified": foundArticle.updatedAt || articleData.date,
    "author": [{
      "@type": "Organization",
      "name": articleData.author,
      "url": siteUrl
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Prime Time | Asia Leading Media House",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/favicon.ico`,
        "width": 32,
        "height": 32
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/Pages/${foundArticle.category || category}/${slugify(foundArticle.subCategory) || subCategory}/${slug}`
    }
  };

  // 3. Render
  const sectionTitle = lang === 'hi' ? getHindiCategory(sectionKey) : sectionKey;
  
  if (lang === 'hi') {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HindiArticlePage
          article={articleData}
          relatedArticles={related}
          topNews={topNews}
          recommendedStories={recommendedStories}
          section={sectionTitle}
          category={foundArticle.subCategory || subCategory}
        />
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePageClient
        article={articleData}
        relatedArticles={related}
        topNews={topNews}
        recommendedStories={recommendedStories}
        section={sectionTitle}
        category={foundArticle.subCategory || subCategory}
        translations={{
          alsoRead: "Also Read",
          trendingTags: "Trending Tags",
          publishedBy: "Published by",
          moreFrom: `More From ${sectionKey.toUpperCase()}`,
          latestNews: `Latest ${sectionKey.toUpperCase()} News`,
          mustRead: "MUST READ",
          advertisement: "ADVERTISEMENT"
        }}
      />
    </>
  );
}

// Reuse slugify logic in client component or props
function slugify(text: string) {
    if (!text) return "";
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
