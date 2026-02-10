"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './MoreFromSection.module.scss';

export interface MoreFromItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
  category?: string;
}

interface MoreFromSectionProps {
  sectionTitle: string;
  sectionKey?: 'india' | 'sports' | 'business' | 'entertainment' | 'lifestyle' | 'all';
  columns?: 2 | 3;
  limit?: number;
  items:any;
}

const MoreFromSection: React.FC<MoreFromSectionProps> = ({ 
  sectionTitle,
  sectionKey = 'all',
  columns = 2,
  limit = 6
}) => {
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const getSectionData = () => {
    switch (sectionKey) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle': return lifestyleNews || [];
      default: return allNews || [];
    }
  };

  const items: MoreFromItem[] = useMemo(() => {
    const rawData = getSectionData();
    return rawData.slice(0, limit).map((item: any, index) => ({
      id: `${sectionKey}-${item.slug}-${index}`,
      title: item.title,
      image: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      slug: item.slug,
      category: item.category,
    }));
  }, [getSectionData(), sectionKey, limit]);

  if (items.length === 0) {
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
          const href = item.slug ? `/Pages/${sectionKey}/${item.slug}` : `#${item.id}`;
          const isImageLeft = index % 2 === 0;
          
          return (
            <Link 
              key={item.id} 
              href={href}
              className={`${styles.newsItem} ${isImageLeft ? styles.imageLeft : styles.imageRight}`}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={item.image.startsWith('http') ? item.image : `/public/${item.image}`}
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
};

export default MoreFromSection;
