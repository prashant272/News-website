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
import { getEnglishCategory, getHindiCategory } from '@/Utils/categoryMapping';
import StateNewsHeader from '@/app/Components/Common/StateNewsHeader/StateNewsHeader';

export default function CategoryPage() {
  const params = useParams();
  const context = useNewsContext();
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const category = params?.category as string;
  const decodedCategory = decodeURIComponent(category || '');
  const urlCategory = getEnglishCategory(decodedCategory).toLowerCase();

  const categoryTitle = useMemo(() => {
    if (!category) return '';
    return urlCategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [urlCategory, category]);

  const mappedSection = useMemo(() => {
    if (!urlCategory) return '';
    const sectionMap: { [key: string]: string } = {
      'technology': 'tech'
    };
    return sectionMap[urlCategory] || urlCategory;
  }, [urlCategory]);

  const filteredNews = useMemo(() => {
    if (!urlCategory || !context?.allNews) return [];

    return context.allNews.filter((news) => {
      const newsCategory = news.category?.toLowerCase() || '';
      const newsSection = (news as any).section?.toLowerCase() || '';
      return newsCategory === urlCategory || newsCategory === mappedSection
        || newsSection === urlCategory || newsSection === mappedSection;
    });
  }, [urlCategory, context?.allNews, mappedSection]);

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


  const latestNews = useMemo(() => {
    const latest = filteredNews.filter(news => news.isLatest === true);
    return latest.length >= 10 ? latest : filteredNews.slice(0, 10);
  }, [filteredNews]);

  const trendingNews = useMemo(() => {
    const trending = filteredNews.filter(news => news.isTrending === true);
    return trending.length >= 10 ? trending : filteredNews.slice(0, 10);
  }, [filteredNews]);


  // Get unique sub-categories from filtered news
  const subCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    filteredNews.forEach((news) => {
      // If news.category is the section (e.g., 'Business'), then subCategory is 'Market'
      // If news.section is the section, then news.category is the subCategory
      const newsCat = news.category?.toLowerCase() || '';
      const newsSection = (news as any).section?.toLowerCase() || '';

      if (newsSection === urlCategory || newsSection === mappedSection) {
        if (news.category && news.category.toLowerCase() !== urlCategory) {
          categoriesSet.add(news.category);
        }
      } else if (newsCat === urlCategory || newsCat === mappedSection) {
        if (news.subCategory && news.subCategory.toLowerCase() !== urlCategory) {
          categoriesSet.add(news.subCategory);
        }
      }
    });
    return Array.from(categoriesSet).slice(0, 10);
  }, [filteredNews, urlCategory, mappedSection]);

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
        {isInitialLoading && (
          <div className="flex flex-col items-center gap-3 mt-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Fetching the latest {categoryTitle} news...</p>
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


  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: categoryTitle, item: `/Pages/${category}` }
        ]}
      />
      
      {(decodedCategory === 'राज्य' || decodedCategory === 'राज्य समाचार') && (
        <StateNewsHeader />
      )}

      {hasDataChecked && infiniteNews.length === 0 && !infiniteLoading && !context.loading ? (
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
      ) : (
        <>
          <NewsSection
            sectionTitle={categoryTitle}
            subCategories={subCategories}
            mainNews={transformedNews}
            topNews={transformedTrendingNews}
            showSidebar={true}
            gridColumns={3}
            lang="hi"
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
        </>
      )}

      <SocialShare
        url={currentUrl || `https://www.primetimemedia.in/Pages/${category}`}
        title={`${categoryTitle} - Latest News & Updates`}
        description={`Stay updated with the latest ${categoryTitle} news, breaking stories, trending topics, and in-depth analysis.`}
        image={infiniteNews[0]?.image || ''}
        isArticle={false}
      />

      <LatestNewsSection
        sectionTitle={`ताज़ा ${getHindiCategory(urlCategory)} समाचार`}
        overrideSection={urlCategory}
        showReadMore={true}
        readMoreLink={`/Pages/${decodedCategory}`}
        columns={3}
      />

      <VideosSection />

      <MoreFromSection
        sectionTitle={`More From ${categoryTitle}`}
        overrideSection={urlCategory}
        columns={2}
        limit={8}
        lang="hi"
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
