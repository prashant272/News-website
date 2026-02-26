"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { useInfiniteNews } from '@/app/hooks/NewsApi';
import LatestNewsSection from '@/app/Components/Common/LatestNewsSection/LatestNewsSection';
import MoreFromSection from '@/app/Components/Common/MoreFromSection/MoreFromSection';
import NewsSection from '@/app/Components/Common/NewsSection/NewsSection';
import { PhotosSection } from '@/app/Components/Common/PhotosSection/Photos';
import { VideosSection } from '@/app/Components/Common/VideosSection/VideosSection';
import SocialShare from '@/app/Components/Common/SocialShare/SocialShare';

interface NewsItem {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  section?: string;
  tags?: string[];
  isLatest?: boolean;
  isTrending?: boolean;
  _id?: string;
  targetLink?: string;
  nominationLink?: string;
}

export default function SubCategoryPage() {
  const params = useParams();
  const context = useNewsContext();
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const category = params?.category as string;
  const subCategory = params?.subCategory as string;

  const normalize = (str: string | undefined) =>
    str
      ? decodeURIComponent(str)
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim()
      : '';

  const cleanDisplay = (text: string | undefined): string => {
    if (!text) return '';
    return decodeURIComponent(text)
      .replace(/%26/g, '&')
      .replace(/%20/g, ' ')
      .replace(/%2B/g, '+')
      .replace(/&amp;/g, '&')
      .trim();
  };

  const toTitleCase = (str: string) =>
    str
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const pageTitle = useMemo(() => {
    if (!category) return '';
    return toTitleCase(cleanDisplay(category));
  }, [category]);

  const subPageTitle = useMemo(() => {
    if (!subCategory) return '';
    return toTitleCase(cleanDisplay(subCategory));
  }, [subCategory]);

  const urlSection = useMemo(() => decodeURIComponent(category || '').toLowerCase(), [category]);

  // Infinite Scroll Logic
  const {
    items: infiniteNews,
    loading: infiniteLoading,
    hasMore,
    fetchNextPage,
    hasDataChecked,
    isInitialLoading
  } = useInfiniteNews(urlSection || '', [], 20);

  // Filter the infiniteNews stream for our specific subcategory
  const subFilteredNews = useMemo(() => {
    const normCategory = normalize(category);
    const normSubCategory = normalize(subCategory);

    return infiniteNews.filter((news) => {
      const newsCat = normalize(news.category);
      const newsSub = normalize(news.subCategory);
      const newsSection = normalize((news as any).section);

      return (
        (newsCat === normCategory && newsSub === normSubCategory) ||
        (newsSection === normCategory && newsCat === normSubCategory)
      );
    });
  }, [infiniteNews, category, subCategory]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (infiniteLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      // If we are intersecting and there's more data, fetch it.
      // We also fetch more if we have very FEW items matching our subcategory, 
      // even if we are at the bottom, to ensure the user isn't stuck with empty results while more exist deep in the section.
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [infiniteLoading, hasMore, fetchNextPage]);

  // If we have very few results but the section has more pages, auto-fetch next page to fill the view
  useEffect(() => {
    if (!infiniteLoading && hasMore && subFilteredNews.length < 6 && infiniteNews.length > 0) {
      const timer = setTimeout(() => {
        fetchNextPage();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [subFilteredNews.length, infiniteLoading, hasMore, fetchNextPage, infiniteNews.length]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const latestNews = useMemo(() => subFilteredNews.filter(news => news.isLatest === true), [subFilteredNews]);
  const trendingNews = useMemo(() => subFilteredNews.filter(news => news.isTrending === true), [subFilteredNews]);

  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    subFilteredNews.forEach((news) => {
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
  }, [subFilteredNews]);

  const transformedNews = subFilteredNews.map((news, index) => ({
    id: news._id || news.slug || `news-${index}`,
    image: news.image || '',
    title: news.title,
    slug: news.slug,
    category: news.category,
    subCategory: cleanDisplay(news.subCategory) || '',
    targetLink: news.targetLink,
    nominationLink: news.nominationLink
  }));

  if (!context) return <div className="p-20 text-center"><h2>Context not available</h2></div>;

  if (context.error) {
    return (
      <div className="p-20 text-center">
        <h2>Error: {context.error}</h2>
        <button onClick={context.refetch} className="mt-4 px-4 py-2 bg-primary text-white rounded">Retry</button>
      </div>
    );
  }

  // Truly loading state
  if (isInitialLoading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold">Searching in {pageTitle}...</h2>
        <p className="text-gray-500">Retrieving the latest news for {subPageTitle}.</p>
      </div>
    );
  }

  // If we finished loading all pages and still found nothing
  if (hasDataChecked && subFilteredNews.length === 0 && !infiniteLoading) {
    notFound();
  }

  return (
    <>
      <NewsSection
        sectionTitle={`${pageTitle}: ${subPageTitle}`}
        subCategories={topTags}
        mainNews={transformedNews}
        topNews={trendingNews.slice(0, 5).map((news, index) => ({
          id: news._id || news.slug || `trending-${index}`,
          title: news.title,
          image: news.image || '',
          slug: news.slug,
          subCategory: cleanDisplay(news.subCategory)
        }))}
        showSidebar={true}
        gridColumns={3}
      />

      <div ref={lastElementRef} className="py-10 text-center flex flex-col items-center justify-center">
        {infiniteLoading && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Searching for more {subPageTitle} news...
          </div>
        )}
        {!hasMore && subFilteredNews.length > 0 && (
          <p className="text-gray-500 italic">No more stories in this subcategory.</p>
        )}
        {hasMore && !infiniteLoading && subFilteredNews.length > 0 && (
          <button onClick={() => fetchNextPage()} className="px-6 py-2 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all">
            Load More Stories
          </button>
        )}
      </div>

      <SocialShare
        url={currentUrl || `https://www.primetimemedia.in/Pages/${category}/${subCategory}`}
        title={`${subPageTitle} - ${pageTitle} | Latest News`}
        description={`Explore the latest ${subPageTitle} news from ${pageTitle} section. Trending stories and updates.`}
        image={subFilteredNews[0]?.image || ''}
        isArticle={false}
      />

      {category?.toLowerCase() !== 'awards' && (
        <LatestNewsSection
          sectionTitle={`Latest ${subPageTitle} News`}
          showReadMore={true}
          readMoreLink={`/Pages/${category}/${subCategory}`}
          columns={3}
        />
      )}

      <VideosSection />

      <MoreFromSection
        sectionTitle={`More From ${pageTitle}`}
        overrideSection={category as any}
        columns={2}
        limit={8}
      />
    </>
  );
}
