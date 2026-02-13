"use client";

import React from 'react';
import Link from 'next/link';
import { useNewsSectionData, MoreFromItem } from '@/app/hooks/useNewsSectionData';
import styles from './MoreFromSection.module.scss';

interface MoreFromSectionProps {
  sectionTitle: string;
  overrideSection?: string;
  columns?: 2 | 3 | 4;
  limit?: number;
  excludeSlug?: string;
}

export default function MoreFromSection({
  sectionTitle,
  overrideSection,
  columns = 3,
  limit = 6,
  excludeSlug,
}: MoreFromSectionProps) {
  const { items, isLoading } = useNewsSectionData<MoreFromItem>({
    variant: 'more-from',
    overrideSection,
    limit,
    excludeSlug,
  });

  if (isLoading || items.length === 0) {
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
          const categorySlug = (item.subCategory || item.section)
            .toLowerCase()
            .replace(/\s+/g, '-');

          const href = item.slug ? item.href : '#';

          const isImageLeft = index % 2 === 0;

          return (
            <Link
              key={item.id}
              href={href}
              className={`${styles.newsItem} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}
            >
              <div className={styles.imageContainer}>
                <img
                  src={item.image}
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
}