"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useNewsSectionData, MoreFromItem } from '@/app/hooks/useNewsSectionData';
import { formatDateTime } from '@/Utils/Utils';
import styles from './MoreFromSection.module.scss';
import Image from 'next/image';
import HindiNewsCard from '../HindiNewsCard/HindiNewsCard';

interface MoreFromSectionProps {
  sectionTitle: string;
  overrideSection?: string;
  excludeSlug?: string;
  columns?: number;
  limit?: number;
  lang?: string;
  categoryName?: string;
}

export default function MoreFromSection({
  sectionTitle,
  overrideSection,
  excludeSlug,
  columns = 3,
  limit = 9,
  lang,
  categoryName = 'CATEGORY',
}: MoreFromSectionProps) {
  const [visibleCount, setVisibleCount] = useState(limit);

  const { items, isLoading } = useNewsSectionData<MoreFromItem>({
    variant: 'more-from',
    overrideSection,
    limit: 50, // Fetch more in background to support "Read More"
    excludeSlug,
    lang,
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

      <div className={`${styles.itemsGrid} ${lang === 'hi' ? styles.hindiGrid : ''}`}>
        {visibleItems.map((item) => {
          if (lang === 'hi') {
            return (
              <HindiNewsCard
                key={item.id}
                item={item}
                lang={lang}
                orientation="horizontal"
                compact={true}
              />
            );
          }

          const href = item.href || '#';
          const isAward = overrideSection?.toLowerCase() === "awards" || item.category?.toString().toUpperCase() === "AWARDS";
          
          return (
            <div
              key={item.id}
              className={`${styles.newsCard} ${isAward ? styles.awardCard : ''}`}
              onClick={() => {
                if (href !== '#') {
                  window.open(href, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{ cursor: 'pointer' }}
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

                {isAward && (
                  <div className={styles.awardActions}>
                    {item.targetLink && (
                      <a
                        href={item.targetLink.startsWith('http') ? item.targetLink : `https://${item.targetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.moreInfoBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Info
                      </a>
                    )}
                    {item.nominationLink && (
                      <a
                        href={item.nominationLink.startsWith('http') ? item.nominationLink : `https://${item.nominationLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.nominationBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Nominate
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.readMoreBtn} onClick={handleReadMore}>
            <span>
              {lang === 'hi'
                ? `${categoryName === 'CATEGORY' ? '' : categoryName} और खबरें देखें`
                : `READ MORE ${categoryName.toUpperCase()} NEWS`}
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
