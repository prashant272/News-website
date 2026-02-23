"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { NewsItem } from '@/app/services/NewsService';
import { useInfiniteNews } from '@/app/hooks/NewsApi';
import LatestNewsSection from '@/app/Components/Common/LatestNewsSection/LatestNewsSection';
import MoreFromSection from '@/app/Components/Common/MoreFromSection/MoreFromSection';
import NewsSection from '@/app/Components/Common/NewsSection/NewsSection';
import { PhotosSection } from '@/app/Components/Common/PhotosSection/Photos';
import { VideosSection } from '@/app/Components/Common/VideosSection/VideosSection';
import SocialShare from '@/app/Components/Common/SocialShare/SocialShare';
import BreadcrumbSchema from '@/app/Components/Common/JSONLD/BreadcrumbSchema';

export default function CategoryPage() {
  const params = useParams();
  const context = useNewsContext();
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const category = params?.category as string;
  const urlCategory = category?.toLowerCase();

  const categoryTitle = useMemo(() => {
    if (!category) return '';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [category]);

  const filteredNews = useMemo(() => {
    if (!urlCategory || !context?.allNews) return [];

    const sectionMap: { [key: string]: string } = {
      'technology': 'tech'
    };
    const mappedSection = sectionMap[urlCategory] || urlCategory;

    return context.allNews.filter((news) => {
      const newsCategory = news.category?.toLowerCase() || '';
      const newsSection = (news as any).section?.toLowerCase() || '';
      return newsCategory === urlCategory || newsCategory === mappedSection
        || newsSection === urlCategory || newsSection === mappedSection;
    });
  }, [urlCategory, context?.allNews]);

  // isFiltering: true while loading OR while allNews hasn't arrived yet
  const isFiltering = context.loading || !context?.allNews;

  // Infinite Scroll Logic
  const { items: infiniteNews, loading: infiniteLoading, hasMore, fetchNextPage, hasDataChecked, isInitialLoading } = useInfiniteNews(urlCategory || '', filteredNews);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (infiniteLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [infiniteLoading, hasMore, fetchNextPage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);


  const latestNews = filteredNews.filter(news => news.isLatest === true);
  const trendingNews = filteredNews.filter(news => news.isTrending === true);

  // Top 10 most-used tags from all filtered news
  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    filteredNews.forEach((news) => {
      const tags = (news as any).tags as string[] | undefined;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          if (tag && tag.trim()) {
            const t = tag.trim();
            tagCount[t] = (tagCount[t] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [filteredNews]);

  const transformedNews = infiniteNews.map((news, index) => ({
    id: news._id || news.slug || `news-${index}`,
    image: news.image || '',
    title: news.title,
    slug: news.slug,
    category: news.category,
    subCategory: news.subCategory || '',
    targetLink: news.targetLink,
    nominationLink: news.nominationLink
  }));

  const transformedTrendingNews = trendingNews.slice(0, 5).map((news, index) => ({
    id: news.slug || `trending-${index}`,
    title: news.title,
    image: news.image || '',
    slug: news.slug,
    subCategory: news.subCategory
  }));

  const transformedLatestNews = (latestNews.length > 0 ? latestNews : filteredNews.slice(0, 6)).map((news, index) => ({
    id: news.slug || `latest-${index}`,
    category: news.category || category,
    title: news.title,
    image: news.image || '',
    slug: news.slug
  }));

  if (!context) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Context not available</h2>
      </div>
    );
  }

  if (context.loading || isFiltering || isInitialLoading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        {isInitialLoading && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Fetching the latest {categoryTitle} news directly from our database...</p>
          </div>
        )}
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


  // Final check: If we've finished all loading and checking, and still have 0 news, it's truly empty
  if (hasDataChecked && infiniteNews.length === 0 && !infiniteLoading && !context.loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-3xl font-bold mb-4">No Stories Found</h2>
        <p className="text-gray-500 max-w-md">We couldn't find any news in the {categoryTitle} section right now. Please check back later or try another category.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all font-semibold"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: categoryTitle, item: `/Pages/${category}` }
        ]}
      />
      <NewsSection
        sectionTitle={categoryTitle}
        subCategories={topTags}
        mainNews={transformedNews}
        topNews={transformedTrendingNews}
        showSidebar={true}
        gridColumns={3}
      />

      {/* Infinite Scroll Trigger & Loading Indicator */}
      <div ref={lastElementRef} style={{ height: '40px', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {infiniteLoading && (
          <div className="flex items-center gap-2 text-primary font-semibold">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading more stories...
          </div>
        )}
        {!hasMore && infiniteNews.length > 0 && (
          <p className="text-gray-500 text-sm italic">You've reached the end of {categoryTitle} news.</p>
        )}
      </div>

      <SocialShare
        url={currentUrl || `https://www.primetimemedia.in/Pages/${category}`}
        title={`${categoryTitle} - Latest News & Updates`}
        description={`Stay updated with the latest ${categoryTitle} news, breaking stories, trending topics, and in-depth analysis.`}
        image={infiniteNews[0]?.image || ''}
        isArticle={false}
      />

      <LatestNewsSection
        sectionTitle={`Latest ${categoryTitle} News`}
        overrideSection={category}
        showReadMore={true}
        readMoreLink={`/Pages/${category}`}
        columns={3}
      />

      <VideosSection />

      <MoreFromSection
        sectionTitle={`More From ${categoryTitle}`}
        overrideSection={category as any}
        columns={2}
        limit={8}
      />

      <SocialShare
        url={currentUrl || `https://www.primetimemedia.in/Pages/${category}`}
        title={`${categoryTitle} - Latest News & Updates`}
        description={`Stay updated with the latest ${categoryTitle} news, breaking stories, trending topics, and in-depth analysis.`}
        image={infiniteNews[0]?.image || ''}
        isArticle={false}
      />

    </>
  );
}
