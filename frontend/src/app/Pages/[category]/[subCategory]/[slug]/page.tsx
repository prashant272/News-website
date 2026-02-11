"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import ArticlePageClient from '@/app/Components/ArticlePage/ArticlePageClient/ArticlePageClient';

interface NewsItem {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  tags?: string[];
  isLatest?: boolean;
  isTrending?: boolean;
  _id?: string;
}

export interface ArticleData {
  id: string | number;
  section: string;
  category: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  author?: string;
  readTime?: string;
  content: string;
  tags?: string[];
  slug: string;
}

export interface SidebarNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category: string;
}

export interface RelatedArticle {
  id: string | number;
  title: string;
  slug: string;
  section?: string;
  category?: string;
  image?: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const context = useNewsContext();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [topNews, setTopNews] = useState<SidebarNewsItem[]>([]);
  const [recommendedStories, setRecommendedStories] = useState<SidebarNewsItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  const category = params?.category as string;
  const subCategory = params?.subCategory as string;
  const slug = params?.slug as string;

  useEffect(() => {
    if (!slug || !context?.allNews) {
      setIsProcessing(true);
      return;
    }

    const foundArticle = context.allNews.find((news) => news.slug === slug);

    if (foundArticle) {
      const articleData: ArticleData = {
        id: foundArticle._id || foundArticle.slug,
        section: foundArticle.category || category,
        category: foundArticle.subCategory || subCategory,
        title: foundArticle.title,
        subtitle: foundArticle.summary || '',
        image: foundArticle.image || '/placeholder.jpg',
        date: new Date().toISOString(),
        author: 'News Desk',
        readTime: '5 min read',
        content: foundArticle.content || 'Content not available',
        tags: foundArticle.tags || [],
        slug: foundArticle.slug
      };

      setArticle(articleData);

      const related = context.allNews
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

      setRelatedArticles(related);

      const categoryNews = context.allNews
        .filter((news) => news.category === foundArticle.category);

      setTopNews(
        categoryNews.slice(0, 2).map((news) => ({
          id: news._id || news.slug,
          title: news.title,
          image: news.image || '/placeholder.jpg',
          slug: news.slug,
          section: news.category || '',
          category: news.subCategory || ''
        }))
      );

      setRecommendedStories(
        categoryNews.slice(2, 7).map((news) => ({
          id: news._id || news.slug,
          title: news.title,
          image: news.image || '/placeholder.jpg',
          slug: news.slug,
          section: news.category || '',
          category: news.subCategory || ''
        }))
      );
    } else {
      setArticle(null);
    }

    setIsProcessing(false);
  }, [slug, category, subCategory, context?.allNews]);

  if (!context) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Context not available</h2>
      </div>
    );
  }

  if (context.loading || isProcessing) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (context.error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Error: {context.error}</h2>
        <button onClick={context.refetch}>Retry</button>
      </div>
    );
  }

  if (!article) {
    notFound();
  }

  return (
    <ArticlePageClient
      article={article}
      relatedArticles={relatedArticles}
      topNews={topNews}
      recommendedStories={recommendedStories}
      section={category}
      category={subCategory}
    />
  );
}
