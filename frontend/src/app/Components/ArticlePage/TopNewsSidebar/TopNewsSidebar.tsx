'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './TopNewsSidebar.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';

interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category?: string;
}

interface TopNewsSidebarProps {
  news: TopNewsItem[];
}

export default function TopNewsSidebar({ news }: TopNewsSidebarProps) {
  const { data: ads, loading: adsLoading } = useActiveAds();
  const sidebarAds = (ads || []).filter(ad => ad.isActive && (ad.sidebarImageUrl || ad.placement === 'sidebar'));
  
  const [adIndices, setAdIndices] = useState<number[]>([]);

  useEffect(() => {
    if (sidebarAds.length > 0) {
      const interleavedCount = Math.floor(news.length / 4);
      setAdIndices(Array(interleavedCount).fill(0).map((_, i) => i % sidebarAds.length));
    }
  }, [sidebarAds.length, news.length]);

  const renderAd = (index: number) => {
    if (adsLoading || sidebarAds.length === 0) return null;
    
    const adIndex = adIndices[index] ?? 0;
    const currentAd = sidebarAds[adIndex % sidebarAds.length];
    
    if (!currentAd) return null;

    return (
      <div className={styles.sidebarAdContainer} key={`ad-${index}`}>
        <span className={styles.adTag}>ADVERTISEMENT</span>
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adLinkWrapper}
        >
          <img
            src={currentAd.sidebarImageUrl || currentAd.imageUrl}
            alt={currentAd.title || "Advertisement"}
            className={styles.adBanner}
            loading="lazy"
          />
        </a>
      </div>
    );
  };

  if (!news || news.length === 0) return null;

  return (
    <div className={styles.topNewsSidebar}>
      <div className={styles.sidebarHeading}>
        <h2>TOP STORIES</h2>
        <div className={styles.headingAccent} />
      </div>

      <div className={styles.listContainer}>
        {news.map((item, index) => {
          const sectionSlug = item.section.toLowerCase();
          const categorySlug = (item.category || 'general')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          const href = `/Pages/${sectionSlug}/${categorySlug}/${item.slug}`;

          return (
            <React.Fragment key={item.id}>
              <Link href={href} className={styles.newsCard}>
                <div className={styles.cardImage}>
                   <Image
                     src={item.image || '/placeholder.jpg'}
                     alt={item.title}
                     fill
                     sizes="120px"
                     className={styles.img}
                   />
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.sectionLabel}>{item.section}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              </Link>
              
              {/* Interleave ad every 4 items for better balance */}
              {(index + 1) % 4 === 0 && renderAd(Math.floor(index / 4))}
            </React.Fragment>
          );
        })}
      </div>

      <Link href="/Pages/india" className={styles.viewMoreBtn}>
        <span>View all top stories</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}