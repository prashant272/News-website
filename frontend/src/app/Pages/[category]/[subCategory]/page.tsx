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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }

    if (!category || !subCategory || !context?.allNews) {
      setIsFiltering(true);
      return;
    }

    const cleanCat = cleanDisplay(category);
    const cleanSub = cleanDisplay(subCategory);

    const formattedCategory = toTitleCase(cleanCat);

    setPageTitle(`${formattedCategory}`);

    const normCategory = normalize(category);
    const normSubCategory = normalize(subCategory);

    const filtered = context.allNews.filter((news) => {
      return (
        normalize(news.category) === normCategory &&
        normalize(news.subCategory) === normSubCategory
      );
    });

    setFilteredNews(filtered);
    setIsFiltering(false);
  }, [category, subCategory, context?.allNews]);

  const latestNews = filteredNews.filter(news => news.isLatest === true);
  const trendingNews = filteredNews.filter(news => news.isTrending === true);

  const subCategories = Array.from(
    new Set(
      context?.allNews
        ?.filter(news => normalize(news.category) === normalize(category))
        .map(news => cleanDisplay(news.subCategory))
        .filter((sub): sub is string =>
          !!sub &&
          sub.toLowerCase() !== 'india' &&
          sub.toLowerCase() !== cleanDisplay(category).toLowerCase()
        )
    )
  );

  const transformedNews = filteredNews.map((news, index) => ({
    id: news.id || news.slug || `news-${index}`,
    image: news.image || '',
    title: news.title,
    slug: news.slug,
    category: news.category,
    subCategory: cleanDisplay(news.subCategory) || ''
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
          subCategory: cleanDisplay(news.subCategory)
        }))}
        showSidebar={true}
        gridColumns={3}
      />

      <SocialShare 
        url={currentUrl || `https://yoursite.com/${category}/${subCategory}`}
        title={`${pageTitle} - Latest News & Updates`}
        description={`Explore the latest ${pageTitle} news, trending stories, and in-depth coverage. Stay updated with breaking news and analysis.`}
        image={filteredNews[0]?.image || ''}
        isArticle={false}
      />

      <LatestNewsSection
        sectionTitle={`Latest ${pageTitle} News`}
        // newsData={transformedLatestNews}
        showReadMore={true}
        readMoreLink={`/Pages/${category}/${subCategory}`}
        columns={3}
      />

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
