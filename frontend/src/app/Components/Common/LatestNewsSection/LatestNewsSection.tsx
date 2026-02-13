"use client";

import React from 'react';
import Link from 'next/link';
import { useNewsSectionData, LatestItem } from '@/app/hooks/useNewsSectionData';
import styles from './LatestNewsSection.module.scss';

interface LatestNewsSectionProps {
  sectionTitle: string;
  overrideSection?: string;
  showReadMore?: boolean;
  readMoreLink?: string;
  columns?: 2 | 3 | 4;
  limit?: number;
  newsData?: LatestItem[];
}

export default function LatestNewsSection({
  sectionTitle,
  overrideSection,
  newsData,
  showReadMore = true,
  readMoreLink,
  columns = 3,
  limit = 6,
}: LatestNewsSectionProps) {
  const { items, section, isLoading } = useNewsSectionData<LatestItem>({
    variant: 'latest',
    overrideSection,
    limit,
  });

  const dynamicReadMoreLink = readMoreLink || `/Pages/${section}`;

  if (isLoading || items.length === 0) {
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
          {items.map((item) => {
            const categoryPart = item.subCategory || section || 'news';
            const categorySlug = categoryPart
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');

            const href = item.slug ? item.href : '#';

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
}