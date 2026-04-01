"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { useInfiniteNews } from '@/app/hooks/NewsApi';
import { getEnglishCategory, slugify } from '@/Utils/categoryMapping';
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

  const cleanDisplay = (text: string | undefined): string => {
    if (!text) return '';
    return decodeURIComponent(text)
      .replace(/-/g, ' ') // Replace dashes with spaces for display titles
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
    return cleanDisplay(category);
  }, [category]);

  const subPageTitle = useMemo(() => {
    if (!subCategory) return '';
    return cleanDisplay(subCategory);
  }, [subCategory]);

  const urlSection = useMemo(() => {
    // Correctly translate 'राज्य' or 'राज्य समाचार' to 'regional' for the API fetch
    return getEnglishCategory(category);
  }, [category]);

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
    const engCategorySlug = slugify(urlSection);
    const engSubCategorySlug = getEnglishCategory(subCategory);

    return infiniteNews.filter((news) => {
      // Use slugify for ROBUST matching across languages and formatting
      const newsCatSlug = getEnglishCategory(news.category || '');
      const newsSubSlug = getEnglishCategory(news.subCategory || '');
      const newsSectionSlug = getEnglishCategory((news as any).section || '');
      
      // NEW: Also check for potential 'state' or 'hindiState' fields from DB
      const newsStateSlug = getEnglishCategory((news as any).state || '');
      const newsHindiStateSlug = getEnglishCategory((news as any).hindiState || '');

      const isCategoryMatch = (newsCatSlug === engCategorySlug || newsSectionSlug === engCategorySlug);
      const isSubMatch = (newsSubSlug === engSubCategorySlug || 
                         newsSubSlug === slugify(subCategory) ||
                         newsStateSlug === engSubCategorySlug ||
                         newsHindiStateSlug === engSubCategorySlug ||
                         newsStateSlug === slugify(subCategory));

      // Check for any match that indicates this item belongs to our current localized section/subcat
      return isCategoryMatch && isSubMatch;
    });
  }, [infiniteNews, urlSection, subCategory]);

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

  // Handle case where specific subcat news is deeply nested in the broader section
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

  const trendingNews = useMemo(() => subFilteredNews.filter(news => (news as any).isTrending === true), [subFilteredNews]);

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

  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl overflow-hidden animate-pulse">
              <div className="h-56 bg-gray-200" />
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 mt-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-bold uppercase tracking-widest">{subPageTitle} न्यूज़ लोड हो रही है...</p>
        </div>
      </div>
    );
  }

  // Final 404 Trigger: Only if we Checked everything and found NOTHING
  if (hasDataChecked && subFilteredNews.length === 0 && !infiniteLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-3xl font-bold mb-4">खबरें अभी उपलब्ध नहीं हैं</h2>
        <p className="text-gray-500 max-w-md">{subPageTitle} के लिए फिलहाल कोई खबर उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर से जांचें।</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg">Refresh Karein</button>
      </div>
    );
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
        lang="hi"
      />

      <div ref={lastElementRef} className="py-10 text-center flex flex-col items-center justify-center">
        {infiniteLoading && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Searching for more {subPageTitle} news...
          </div>
        )}
        {!hasMore && subFilteredNews.length > 0 && (
          <p className="text-gray-500 italic">धन्यवाद! आपने सारी खबरें पढ़ ली हैं।</p>
        )}
      </div>

      <SocialShare
        url={currentUrl || `https://www.primetimemedia.in/Pages/${category}/${subCategory}`}
        title={`${subPageTitle} - ${pageTitle} | Latest News`}
        description={`Explore the latest ${subPageTitle} news from ${pageTitle} section.`}
        image={subFilteredNews[0]?.image || ''}
        isArticle={false}
      />

      <VideosSection />

      <MoreFromSection
        sectionTitle={`More From ${pageTitle}`}
        overrideSection={urlSection as any}
        columns={2}
        limit={8}
        lang="hi"
      />
    </>
  );
}
