"use client";

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './MoreFromSection.module.scss';

export interface MoreFromItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
  category?: string;
  section?: string;
}

interface MoreFromSectionProps {
  sectionTitle: string;
  overrideSection?: 'india' | 'sports' | 'business' | 'entertainment' | 'lifestyle' | 'all'; 
  columns?: 2 | 3 | 4;
  limit?: number;
  excludeSlug?: string;           
}

const MoreFromSection: React.FC<MoreFromSectionProps> = ({
  sectionTitle,
  overrideSection,
  columns = 3,
  limit = 6,
  excludeSlug,
}) => {
  const pathname = usePathname();
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const getCurrentSection = (): string => {
    if (overrideSection) return overrideSection;

    const parts = pathname.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');

    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      const candidate = parts[pagesIndex + 1];
      if (['india', 'sports', 'business', 'entertainment', 'lifestyle'].includes(candidate)) {
        return candidate;
      }
    }

    return 'india';
  };

  const section = getCurrentSection();

  const sectionData = useMemo(() => {
    switch (section) {
      case 'india':        return indiaNews || [];
      case 'sports':       return sportsNews || [];
      case 'business':     return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle':    return lifestyleNews || [];
      default:             return allNews || [];
    }
  }, [section, allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews]);

  const items: MoreFromItem[] = useMemo(() => {
    let filtered = sectionData;

    if (excludeSlug) {
      filtered = filtered.filter(item => item.slug !== excludeSlug);
    }

    return filtered
      .slice(0, limit)
      .map((item: any, index: number) => ({
        id: `${section}-${item.slug || 'no-slug'}-${index}`,
        title: item.title || 'Untitled',
        image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        slug: item.slug,
        category: item.category,
        section,
      }));
  }, [sectionData, section, limit, excludeSlug]);

  if (items.length === 0) {
    return (
      <div className={styles.moreFromWrapper}>
        <div className={`${styles.itemsGrid} ${styles[`cols${columns}`]} animate-pulse`}>
          {Array(columns * 2).fill(0).map((_, i) => (
            <div key={i} className={`${styles.newsItem} ${i % 2 === 0 ? styles.imageLeft : styles.imageRight}`}>
              <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-64 rounded-xl"></div>
              <div className="h-20 bg-gray-200 rounded-lg mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.moreFromWrapper}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        <div className={styles.titleUnderline}></div>
      </div>

      <div className={`${styles.itemsGrid} ${styles[`cols${columns}`]}`}>
        {items.map((item, index) => {
          const href = item.slug
            ? `/Pages/${item.section || section}/${item.slug}`
            : '#';

          const isImageLeft = index % 2 === 0;

          return (
            <Link
              key={item.id}
              href={href}
              className={`${styles.newsItem} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}
            >
              <div className={styles.imageContainer}>
                <img
                  src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/public/${item.image}`}
                  alt={item.title}
                  loading="lazy"
                />
                <div className={styles.imageOverlay}></div>
              </div>

              <div className={styles.contentContainer}>
                <h3 className={styles.newsTitle}>{item.title}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MoreFromSection;