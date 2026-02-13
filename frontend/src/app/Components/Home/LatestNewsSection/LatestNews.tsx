"use client";

import React from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './LatestNews.module.scss';

interface DisplayItem {
  id: string;
  title: string;
  image: string;
  category: string;
  section: string;
  subCategory?: string;
  slug: string;
  href: string;
}

const LatestNews: React.FC = () => {
  const { allNews, loading } = useNewsContext();

  const displayNews: DisplayItem[] = (() => {
    if (!allNews || !Array.isArray(allNews) || allNews.length === 0) {
      return [];
    }

    const latestItems = allNews
      .filter((item: any) => item.isLatest === true)
      .slice(0, 6);

    const itemsToMap = latestItems.length > 0 ? latestItems : allNews.slice(0, 6);

    return itemsToMap.map((item: any, idx: number) => {
      const section = item.section || 'news';
      const sub = item.subCategory || section;
      const catSlug = sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id: `latest-${item.slug || idx}`,
        title: item.title || 'Untitled',
        image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        category: item.category || section.charAt(0).toUpperCase() + section.slice(1),
        section,
        subCategory: item.subCategory,
        slug: item.slug || '',
        href: item.slug ? `/Pages/${section}/${catSlug}/${item.slug}` : '#',
      };
    });
  })();

  if (loading) {
    return (
      <section className={styles.latestNewsSection}>
        <div className={styles.container}>
          <div className={styles.newsGrid}>
            {[0, 1, 2].map((i) => (
              <article key={i} className={styles.newsItem}>
                <div className={`${styles.content} animate-pulse bg-gray-200 h-24 rounded`}></div>
                <div className={`${styles.imageWrapper} animate-pulse bg-gray-200 h-48 rounded`}></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayNews.length === 0) {
    return (
      <section className={styles.latestNewsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Latest News</h2>
            <div className={styles.titleUnderline}></div>
          </div>
          <p className="text-center text-gray-500 py-12">
            No breaking/latest news available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.latestNewsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Latest News</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.newsGrid}>
          {displayNews.map((item) => {
            const categorySlug = (item.subCategory || item.section)
              .toLowerCase()
              .replace(/\s+/g, '-');

            return (
              <article key={item.id} className={styles.newsItem}>
                <div className={styles.content}>
                  <span className={styles.category}>{item.category}</span>
                  <h3 className={styles.newsTitle}>
                    <Link href={item.href} className="hover:underline">
                      {item.title}
                    </Link>
                  </h3>
                </div>
                <div className={styles.imageWrapper}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded"
                    loading="lazy"
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.readMoreWrapper}>
          <Link href="/Pages/all" className={styles.readMoreButton}>
            Read More News
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;