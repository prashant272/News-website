'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './NewsSection.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';
import { useState, useEffect, useMemo } from 'react';
import SidebarAds from '../SidebarAds/SidebarAds';
import NewsCard from '../NewsCard/NewsCard';

export interface NewsGridItem {
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
  subCategory: string;
  displaySubCategory?: string;
  isTrending?: boolean;
  targetLink?: string;
  nominationLink?: string;
}

export interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
  subCategory?: string;
  displaySubCategory?: string;
}

interface NewsSectionProps {
  sectionTitle: string;
  subCategories?: string[];
  mainNews?: NewsGridItem[];
  topNews?: TopNewsItem[];
  showSidebar?: boolean;
  gridColumns?: 2 | 3 | 4;
  currentSection?: string;
}

const CATEGORY_TO_SECTION_MAP: Record<string, string> = {
  'Cricket': 'sports', 'Football': 'sports', 'Tennis': 'sports',
  'Badminton': 'sports', 'Hockey': 'sports', 'Athletics': 'sports',
  'Markets': 'business', 'Economy': 'business', 'Banking': 'business',
  'Startups': 'business', 'Cryptocurrency': 'business',
  'AI': 'tech', 'Smartphones': 'tech', 'Gadgets': 'tech',
  'Bollywood': 'entertainment', 'Hollywood': 'entertainment',
  'TV': 'entertainment', 'OTT': 'entertainment',
  'Food': 'lifestyle', 'Travel': 'lifestyle', 'Beauty': 'lifestyle',
  'Maharashtra': 'india', 'National': 'india', 'Politics': 'india',
};

const getSectionFromUrl = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  const pagesIndex = parts.indexOf('Pages');
  if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
    return parts[pagesIndex + 1];
  }
  return 'india';
};

const cleanDisplayText = (text: string): string => {
  return decodeURIComponent(text)
    .replace(/%26/g, '&')
    .replace(/%20/g, ' ')
    .replace(/%2B/g, '+')
    .trim();
};

const NewsSection: React.FC<NewsSectionProps> = ({
  sectionTitle,
  subCategories = [],
  mainNews: providedMainNews,
  topNews: providedTopNews,
  showSidebar = true,
  gridColumns = 3,
}) => {
  const pathname = usePathname();
  const section = getSectionFromUrl(pathname);
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const sectionNews = (() => {
    switch (section) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle': return lifestyleNews || [];
      default: return allNews || [];
    }
  })();

  const mainNews: NewsGridItem[] = useMemo(() => {
    if (providedMainNews) return providedMainNews;
    return sectionNews.slice(0, 12).map((item, index) => ({
      id: item._id || `${section}-${item.slug || 'no-slug'}-${index}`,
      image: getImageSrc(item.image),
      title: item.title,
      slug: item.slug,
      category: item.category,
      subCategory: item.subCategory || '',
      displaySubCategory: cleanDisplayText(item.subCategory || ''),
      isTrending: item.isTrending,
      targetLink: item.targetLink,
      nominationLink: item.nominationLink
    }));
  }, [providedMainNews, sectionNews, section]);

  const topNews: TopNewsItem[] = useMemo(() => {
    if (providedTopNews) return providedTopNews;
    const trendingNews = sectionNews.filter(item => item.isTrending === true);
    const newsToShow = trendingNews.length >= 10 ? trendingNews : sectionNews;
    return newsToShow.slice(0, 10).map((item, index) => ({
      id: item._id || `${section}-top-${index}`,
      title: item.title,
      image: getImageSrc(item.image),
      slug: item.slug,
      subCategory: item.subCategory,
      displaySubCategory: cleanDisplayText(item.subCategory || '')
    }));
  }, [providedTopNews, sectionNews, section]);

  if (!sectionNews.length && !providedMainNews) {
    return (
      <div className={styles.pageWrapper}>
        <section className={styles.sectionContainer}>
          <div className={`${styles.mainGrid} ${styles[`cols${gridColumns}`]} animate-pulse`}>
            {Array(gridColumns * 4).fill(0).map((_, i) => (
              <div key={i} className={styles.loadingCardSkeleton}>
                <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const hasTrendingNews = sectionNews.some(item => item.isTrending === true);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          {subCategories.length > 0 && (
            <nav className={styles.subCategoryNav}>
              {subCategories.map((cat) => {
                const cleanCat = cleanDisplayText(cat);
                const tagSlug = encodeURIComponent(
                  cleanCat.toLowerCase().replace(/\s+/g, '-')
                );
                return (
                  <Link
                    key={cat}
                    href={`/tag/${tagSlug}`}
                    className={styles.subCategoryLink}
                  >
                    {cleanCat}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className={showSidebar ? styles.layoutWithSidebar : styles.layoutFullWidth}>
          <div className={`${styles.mainGrid} ${styles[`cols${gridColumns}`]}`}>
            {mainNews.map((news) => (
              <NewsCard
                key={news.id}
                currentSection={section}
                {...news}
              />
            ))}
          </div>

          {showSidebar && (
            <aside className={styles.sidebar}>
              <SidebarAds count={4} />

              {topNews.length > 0 && (
                <>
                  <h3 className={styles.topNewsTitle}>
                    {hasTrendingNews ? 'Trending News' : 'Top News'}
                  </h3>
                  <div className={styles.topNewsList}>
                    {topNews.map((news) => (
                      <Link
                        key={news.id}
                        href={news.slug ? `/Pages/${section}/${encodeURIComponent(news.subCategory || 'general')}/${encodeURIComponent(news.slug || '')}` : '#'}
                        className={styles.topNewsItem}
                      >
                        <p>{news.title}</p>
                        <img
                          src={news.image}
                          alt={news.title}
                          loading="lazy"
                        />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </aside>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsSection;
