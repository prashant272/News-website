"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './LatestNewsSection.module.scss';
import { formatDateTime } from '@/Utils/Utils';
import { useNewsContext } from '@/app/context/NewsContext';
import { useNewsSectionData, LatestItem } from '@/app/hooks/useNewsSectionData';


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
  const { items: allItems, section, isLoading } = useNewsSectionData<LatestItem>({
    variant: 'latest',
    overrideSection,
    limit,
  });
  const router = useRouter();

  const items = useMemo(() => {
    const latestItems = allItems.filter((item: any) => item.isLatest === true);
    return latestItems.length >= 3 ? latestItems : allItems;
  }, [allItems]);


  const dynamicReadMoreLink = readMoreLink || `/Pages/${section}`;

  if (isLoading) {
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

  if (items.length === 0) {
    return (
      <section className={styles.latestNewsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{sectionTitle}</h2>
            <div className={styles.titleUnderline}></div>
          </div>
          <p className="text-center text-gray-500 py-12">
            No latest news available right now.
          </p>
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
              <div
                key={item.id}
                className={styles.newsItem}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (href && href !== '#') {
                    router.push(href);
                  }
                }}
              >
                <div className={styles.content}>
                  <span className={styles.category}>{item.category}</span>
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  {item.date && (
                    <div className={styles.newsMeta}>
                      <span className={styles.newsDate}>
                        {formatDateTime(item.date)}
                      </span>
                    </div>
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
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
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
