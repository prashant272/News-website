"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './LatestNewsSection.module.scss';

export interface LatestNewsItem {
  id: string | number;
  category: string;
  title: string;
  image: string;
  slug?: string;
}

interface LatestNewsSectionProps {
  sectionTitle: string;
  sectionKey?: 'india' | 'sports' | 'business' | 'entertainment' | 'lifestyle' | 'all';
  showReadMore?: boolean;
  readMoreLink?: string;
  columns?: 2 | 3 | 4;
  limit?: number;
  newsData?: LatestNewsItem[];
}

const getSectionKeyFromTitle = (title: string): 'india' | 'sports' | 'business' | 'entertainment' | 'lifestyle' | 'all' => {
  const lower = title.toLowerCase();
  if (lower.includes('india') || lower.includes('national')) return 'india';
  if (lower.includes('sport')) return 'sports';
  if (lower.includes('business') || lower.includes('market')) return 'business';
  if (lower.includes('entertainment') || lower.includes('bollywood')) return 'entertainment';
  if (lower.includes('lifestyle') || lower.includes('food') || lower.includes('travel')) return 'lifestyle';
  return 'all';
};

const NewsGridSkeleton: React.FC<{ columns: number; sectionTitle: string }> = ({ columns, sectionTitle }) => (
  <section className={styles.latestNewsSection}>
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{sectionTitle}</h2>
        <div className={styles.titleUnderline}></div>
      </div>
      <div className={`${styles.newsGrid} ${styles[`cols${columns}`]} animate-pulse`}>
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className={styles.newsItem}>
            <div className={`${styles.content} space-y-2`}>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
            <div className={`${styles.imageWrapper} bg-gray-200 h-48 rounded`}></div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LatestNewsSection: React.FC<LatestNewsSectionProps> = React.memo(({
  sectionTitle,
  sectionKey,
  showReadMore = true,
  readMoreLink,
  columns = 3,
  limit = 6,
  newsData,
}) => {
  const context = useNewsContext();
  const effectiveSectionKey = sectionKey || getSectionKeyFromTitle(sectionTitle);

  const sectionData = useMemo(() => {
    if (!context) return [];
    switch (effectiveSectionKey) {
      case 'india':         return context.indiaNews || [];
      case 'sports':        return context.sportsNews || [];
      case 'business':      return context.businessNews || [];
      case 'entertainment': return context.entertainmentNews || [];
      case 'lifestyle':     return context.lifestyleNews || [];
      default:              return context.allNews || [];
    }
  }, [context, effectiveSectionKey]);

  const dynamicReadMoreLink = readMoreLink || `/Pages/${effectiveSectionKey}`;

  const finalNewsData = useMemo(() => {
    if (newsData) {
      return newsData.slice(0, limit);
    }
    const data = Array.isArray(sectionData) ? sectionData.slice(0, limit) : [];
    return data.map((item: any, index) => ({
      id: `${effectiveSectionKey}-${item?.slug || index}`,
      category: item?.category || effectiveSectionKey.toUpperCase(),
      title: item?.title || 'Loading...',
      image: getImageSrc(item?.image),
      slug: item?.slug,
    }));
  }, [newsData, sectionData, effectiveSectionKey, limit]);

  if (context?.loading) {
    return <NewsGridSkeleton columns={columns} sectionTitle={sectionTitle} />;
  }

  if (finalNewsData.length === 0) {
    return null;
  }

  return (
    <section className={styles.latestNewsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{sectionTitle}</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={`${styles.newsGrid} ${styles[`cols${columns}`]}`}>
          {finalNewsData.map((item) => {
            const categorySlug = item.category.toLowerCase().replace(/\s+/g, '-');
            const href = `/Pages/${effectiveSectionKey}/${categorySlug}/${item.slug}`;
            return (
              <Link key={item.id} href={href} className={styles.newsItem}>
                <div className={styles.content}>
                  <span className={styles.category}>{item.category}</span>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                </div>
                <div className={styles.imageWrapper}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {showReadMore && (
          <div className={styles.readMoreWrapper}>
            <Link href={dynamicReadMoreLink} className={styles.readMoreButton}>
              Read More
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

LatestNewsSection.displayName = 'LatestNewsSection';

export default LatestNewsSection;