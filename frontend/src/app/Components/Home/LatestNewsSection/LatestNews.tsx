"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { formatDateTime } from '@/Utils/Utils';
import styles from './LatestNews.module.scss';
import { ChevronDown } from 'lucide-react';

interface DisplayItem {
  id: string;
  title: string;
  image: string;
  category: string;
  section: string;
  subCategory?: string;
  slug: string;
  href: string;
  date?: string;
}

const LatestNews: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const [visibleCount, setVisibleCount] = useState(12);

  const { displayNews, hasMore } = useMemo(() => {
    if (!allNews || !Array.isArray(allNews) || allNews.length === 0) {
      return { displayNews: [], hasMore: false };
    }

    // Explicit sorting by date (descending)
    const sorted = [...allNews].sort((a, b) => {
      const getSafeTime = (item: any) => {
        const d = new Date(item.publishedAt || item.date || item.createdAt || 0);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getSafeTime(b) - getSafeTime(a);
    });

    const items = sorted.slice(0, visibleCount);
    const moreAvailable = visibleCount < sorted.length;

    const mappedItems = items.map((item: any, idx: number) => {
      const section = item.section || 'news';
      const sub = item.subCategory || section;
      const catSlug = sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id: `latest-${item._id || item.slug || idx}`,
        title: item.title || 'Untitled',
        image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        category: item.category || section.charAt(0).toUpperCase() + section.slice(1),
        section,
        subCategory: item.subCategory,
        slug: item.slug || '',
        href: item.slug ? `/Pages/${section}/${catSlug}/${item.slug}` : '#',
        date: item.publishedAt || item.date || item.createdAt,
      };
    });

    return { displayNews: mappedItems, hasMore: moreAvailable };
  }, [allNews, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.spinner}></div></div>;
  }

  if (displayNews.length === 0) return null;

  return (
    <section className={styles.latestNewsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.liveIndicator}></span>
            <h2 className={styles.sectionTitle}>Latest News</h2>
          </div>
          <Link href="/Pages/all" className={styles.viewAll}>View All Latest News</Link>
        </div>

        <div className={styles.horizontalGrid}>
          {displayNews.map((item) => (
            <Link key={item.id} href={item.href} className={styles.newsItem}>
              <div className={styles.imageOverlay}>
                <img src={item.image} alt={item.title} loading="lazy" />
              </div>
              <div className={styles.content}>
                <span className={styles.category}>{item.category}</span>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                {item.date && (
                   <span className={styles.date}>{formatDateTime(item.date)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className={styles.loadMoreWrapper}>
            <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
              Load More News <ChevronDown size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestNews;