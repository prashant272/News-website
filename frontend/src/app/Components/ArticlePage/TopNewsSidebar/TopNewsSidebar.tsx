import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './TopNewsSidebar.module.scss';

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
  return (
    <div className={styles.topNews}>
      <h2 className={styles.heading}>Top News</h2>
      <div className={styles.newsList}>
        {news.map((item) => {
          const sectionSlug = item.section.toLowerCase();

          const categoryValue = item.category || item.section;
          const categorySlug = categoryValue
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

          const href = `/Pages/${sectionSlug}/${categorySlug}/${item.slug}`;

          return (
            <Link
              key={item.id}
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
          );
        })}
      </div>
    </div>
  );
}