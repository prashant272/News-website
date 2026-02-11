"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import LatestNewsSection from '@/app/Components/Common/LatestNewsSection/LatestNewsSection';
import MoreFromSection from '@/app/Components/Common/MoreFromSection/MoreFromSection';
import NewsSection from '@/app/Components/Common/NewsSection/NewsSection';
import { PhotosSection } from '@/app/Components/Common/PhotosSection/Photos';

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
  id?: string;
}

export default function SubCategoryPage() {
  const params = useParams();
  const context = useNewsContext();
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(true);

  const category = params?.category as string;
  const subCategory = params?.subCategory as string;

  useEffect(() => {
    if (!category || !subCategory || !context?.allNews) {
      setIsFiltering(true);
      return;
    }

    const formattedCategory = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const formattedSubCategory = subCategory
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setPageTitle(`${formattedCategory} - ${formattedSubCategory}`);

    const filtered = context.allNews.filter((news) => {
      const newsCategory = news.category?.toLowerCase() || '';
      const newsSubCategory = news.subCategory?.toLowerCase() || '';
      const urlCategory = category.toLowerCase();
      const urlSubCategory = subCategory.toLowerCase();
      
      return newsCategory === urlCategory && newsSubCategory === urlSubCategory;
    });

    setFilteredNews(filtered);
    setIsFiltering(false);
  }, [category, subCategory, context?.allNews]);

  const latestNews = filteredNews.filter(news => news.isLatest === true);
  const trendingNews = filteredNews.filter(news => news.isTrending === true);

  const subCategories = Array.from(
    new Set(
      context?.allNews
        ?.filter(news => news.category?.toLowerCase() === category?.toLowerCase())
        .map(news => news.subCategory)
        .filter(sub => {
          if (!sub) return false;
          const subLower = sub.toLowerCase();
          return subLower !== 'india' && subLower !== category?.toLowerCase();
        })
    )
  ) as string[];

  const transformedNews = filteredNews.map((news, index) => ({
    id: news.id || news.slug || `news-${index}`,
    image: news.image || '',
    title: news.title,
    slug: news.slug,
    category: news.category,
    subCategory: news.subCategory || ''
  }));

  const transformedLatestNews = (latestNews.length > 0 ? latestNews : filteredNews.slice(0, 6)).map((news, index) => ({
    id: news.id || news.slug || `latest-${index}`,
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

  if (context.loading || isFiltering) {
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

  if (filteredNews.length === 0) {
    notFound();
  }

  return (
    <>
      <NewsSection 
        sectionTitle={pageTitle}
        subCategories={subCategories}
        mainNews={transformedNews}
        topNews={trendingNews.slice(0, 5).map((news, index) => ({
          id: news.id || news.slug || `trending-${index}`,
          title: news.title,
          image: news.image || '',
          slug: news.slug,
          subCategory: news.subCategory
        }))}
        showSidebar={true}
        gridColumns={3}
      />
      
      <LatestNewsSection
        sectionTitle={`Latest ${pageTitle} News`}
        newsData={transformedLatestNews}
        showReadMore={true}
        readMoreLink={`/Pages/${category}/${subCategory}`}
        columns={3}
      />
      
      <PhotosSection />
      
      <MoreFromSection 
        sectionTitle={`More From ${pageTitle}`}
        overrideSection={category as any}
        columns={2}
        limit={8}
      />
    </>
  );
}
