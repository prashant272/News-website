"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useNewsSectionData, MoreFromItem } from '@/app/hooks/useNewsSectionData';
import { formatDateTime } from '@/Utils/Utils';
import styles from './MoreFromSection.module.scss';
import Image from 'next/image';

interface MoreFromSectionProps {
  sectionTitle: string;
  overrideSection?: string;
  excludeSlug?: string;
  columns?: number;
  limit?: number;
}

export default function MoreFromSection({
  sectionTitle,
  overrideSection,
  excludeSlug,
  columns = 3,
  limit = 9,
}: MoreFromSectionProps) {
  const [visibleCount, setVisibleCount] = useState(limit);
  
  const { items, isLoading } = useNewsSectionData<MoreFromItem>({
    variant: 'more-from',
    overrideSection,
    limit: 50, // Fetch more in background to support "Read More"
    excludeSlug,
  });

  const handleReadMore = () => {
    setVisibleCount(prev => prev + limit);
  };

  if (isLoading && items.length === 0) {
    return (
      <div className={styles.moreFromWrapper}>
        <div className={styles.sectionHeader}>
           <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
           <div className={styles.titleUnderline} />
        </div>
        <div className={styles.itemsGrid}>
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div className={styles.moreFromWrapper}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
        <div className={styles.titleUnderline}></div>
      </div>

      <div className={styles.itemsGrid}>
        {visibleItems.map((item) => {
          const href = item.href || '#';

          return (
            <Link
              key={item.id}
              href={href}
              className={styles.newsCard}
            >
              <div className={styles.imageBox}>
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.img}
                />
                <div className={styles.categoryBadge}>{item.subCategory || item.section}</div>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.newsTitle}>{item.title}</h3>
                {item.date && (
                  <div className={styles.meta}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <circle cx="12" cy="12" r="10" />
                       <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatDateTime(item.date)}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.readMoreBtn} onClick={handleReadMore}>
            <span>READ MORE CATEGORY NEWS</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}