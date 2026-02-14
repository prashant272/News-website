"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
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
}


export default function CategoryPage() {
  const params = useParams();
  const context = useNewsContext();
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [isFiltering, setIsFiltering] = useState(true);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const category = params?.category as string;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }

    if (!category || !context?.allNews) {
      setIsFiltering(true);
      return;
    }

    const formattedCategory = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    setCategoryTitle(formattedCategory);

    const urlCategory = category.toLowerCase();
    const sectionMap: { [key: string]: string } = {
      'technology': 'tech'
    };
    
    const mappedSection = sectionMap[urlCategory] || urlCategory;

    const filtered = context.allNews.filter((news) => {
      const newsCategory = news.category?.toLowerCase() || '';
      const newsSection = news.section?.toLowerCase() || '';
      
      return newsCategory === urlCategory || 
             newsCategory === mappedSection ||
             newsSection === urlCategory || 
             newsSection === mappedSection;
    });

    setFilteredNews(filtered);
    setIsFiltering(false);
  }, [category, context?.allNews]);

  const latestNews = filteredNews.filter(news => news.isLatest === true);
  const trendingNews = filteredNews.filter(news => news.isTrending === true);

  const subCategories = Array.from(
    new Set(
      filteredNews
        .map(news => news.subCategory)
        .filter(sub => {
          if (!sub) return false;
          const subLower = sub.toLowerCase();
          return subLower !== 'india' && subLower !== category.toLowerCase();
        })
    )
  ) as string[];

  const transformedNews = filteredNews.map((news, index) => ({
    id: news._id || news.slug || `news-${index}`,
    image: news.image || '',
    title: news.title,
    slug: news.slug,
    category: news.category,
    subCategory: news.subCategory || ''
  }));

  const transformedTrendingNews = trendingNews.slice(0, 5).map((news, index) => ({
    id: news._id || news.slug || `trending-${index}`,
    title: news.title,
    image: news.image || '',
    slug: news.slug,
    subCategory: news.subCategory
  }));

  const transformedLatestNews = (latestNews.length > 0 ? latestNews : filteredNews.slice(0, 6)).map((news, index) => ({
    id: news._id || news.slug || `latest-${index}`,
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
        sectionTitle={categoryTitle}
        subCategories={subCategories}
        mainNews={transformedNews}
        topNews={transformedTrendingNews}
        showSidebar={true}
        gridColumns={3}
      />

      <SocialShare 
        url={currentUrl || `https://yoursite.com/${category}`}
        title={`${categoryTitle} - Latest News & Updates`}
        description={`Stay updated with the latest ${categoryTitle} news, breaking stories, trending topics, and in-depth analysis.`}
        image={filteredNews[0]?.image || ''}
        isArticle={false}
      />
      
      <LatestNewsSection
        sectionTitle={`Latest ${categoryTitle} News`}
        overrideSection={category}
        showReadMore={true}
        readMoreLink={`/Pages/${category}`}
        columns={3}
      />

      <VideosSection/>
      
      <MoreFromSection 
        sectionTitle={`More From ${categoryTitle}`}
        overrideSection={category as any}
        columns={2}
        limit={8}
      />

      <SocialShare 
        url={currentUrl || `https://yoursite.com/${category}`}
        title={`${categoryTitle} - Latest News & Updates`}
        description={`Stay updated with the latest ${categoryTitle} news, breaking stories, trending topics, and in-depth analysis.`}
        image={filteredNews[0]?.image || ''}
        isArticle={false}
      />
    </>
  );
}
