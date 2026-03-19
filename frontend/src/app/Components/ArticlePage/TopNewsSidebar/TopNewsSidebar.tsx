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
      // Initialize indices for interleaved ads
      const interleavedCount = Math.floor(news.length / 3);
      setAdIndices(Array(interleavedCount).fill(0).map((_, i) => i % sidebarAds.length));
    }
  }, [sidebarAds.length, news.length]);

  const renderAd = (index: number) => {
    if (adsLoading || sidebarAds.length === 0) return null;
    
    const adIndex = adIndices[index] ?? 0;
    const currentAd = sidebarAds[adIndex % sidebarAds.length];
    
    if (!currentAd) return null;

    return (
      <div className={styles.interleavedAd} key={`ad-${index}`}>
        <span className={styles.adLabel}>ADVERTISEMENT</span>
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adLink}
        >
          <img
            src={currentAd.sidebarImageUrl || currentAd.imageUrl}
            alt={currentAd.title || "Advertisement"}
            className={styles.adImage}
            loading="lazy"
          />
        </a>
      </div>
    );
  };

  return (
    <div className={styles.topNews}>
      <h2 className={styles.heading}>Top News</h2>
      <div className={styles.newsList}>
        {news.map((item, index) => {
          const sectionSlug = item.section.toLowerCase();

          const categoryValue = item.category || 'general';
          const categorySlug = categoryValue
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          const href = `/Pages/${sectionSlug}/${categorySlug}/${item.slug}`;

          return (
            <React.Fragment key={item.id}>
              <Link
                href={href}
                className={styles.newsItem}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={120}
                    height={80}
                    className={styles.image}
                    sizes="120px"
                  />
                </div>
                <h3 className={styles.title}>{item.title}</h3>
              </Link>
              
              {/* Interleave an ad after every 3 items */}
              {(index + 1) % 3 === 0 && renderAd(Math.floor(index / 3))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}