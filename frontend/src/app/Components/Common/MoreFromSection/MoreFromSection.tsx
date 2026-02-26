"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsSectionData, MoreFromItem } from '@/app/hooks/useNewsSectionData';
import { formatDateTime } from '@/Utils/Utils';
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
  const router = useRouter();

  if (isLoading) {
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

  if (items.length === 0) {
    return null;
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
            <div
              key={item.id}
              className={`${styles.newsItem} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (href && href !== '#') {
                  router.push(href);
                }
              }}
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
                {item.date && (
                  <span className={styles.publishDate}>{formatDateTime(item.date)}</span>
                )}

                {(overrideSection?.toLowerCase() === "awards" || item.category?.toUpperCase() === "AWARDS") && (
                  <div className={styles.awardActions}>
                    {(item as any).targetLink && (
                      <a
                        href={(item as any).targetLink.startsWith('http') ? (item as any).targetLink : `https://${(item as any).targetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.moreInfoBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Info
                      </a>
                    )}
                    {(item as any).nominationLink && (
                      <a
                        href={(item as any).nominationLink.startsWith('http') ? (item as any).nominationLink : `https://${(item as any).nominationLink}`}
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
    </div>
  );
}