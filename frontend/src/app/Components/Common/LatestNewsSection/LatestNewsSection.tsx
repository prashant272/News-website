"use client";
import React from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
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
  newsData: LatestNewsItem[];
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

const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({
  sectionTitle,
  sectionKey,
  showReadMore = true,
  readMoreLink,
  columns = 3,
  limit = 6
}) => {
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const effectiveSectionKey = sectionKey || getSectionKeyFromTitle(sectionTitle);

  const getSectionData = () => {
    switch (effectiveSectionKey) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle': return lifestyleNews || [];
      default: return allNews || [];
    }
  };


  const rawData = getSectionData();
  const dynamicReadMoreLink = readMoreLink || `/Pages/${effectiveSectionKey}`;

  const finalNewsData = React.useMemo(() => {
    const data = Array.isArray(rawData) ? rawData.slice(0, limit) : [];
    
    return data.map((item: any, index) => ({
      id: `${effectiveSectionKey}-${item?.slug || index}`,
      category: item?.category || effectiveSectionKey.toUpperCase(),
      title: item?.title || 'Loading...',
      image: item?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      slug: item?.slug,
    }));
  }, [rawData, effectiveSectionKey, limit]);

  if (finalNewsData.length === 0) {
    return (
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
            const href = item.slug 
              ? `/Pages/${effectiveSectionKey}/${item.slug}` 
              : `#${item.id}`;
            
            return (
              <Link key={item.id} href={href} className={styles.newsItem}>
                <div className={styles.content}>
                  <span className={styles.category}>{item.category}</span>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                </div>
                <div className={styles.imageWrapper}>
                  <img 
                    src={item.image.startsWith('http') ? item.image : `/public/${item.image}`}
                    alt={item.title}
                    loading="lazy"
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
};

export default LatestNewsSection;
