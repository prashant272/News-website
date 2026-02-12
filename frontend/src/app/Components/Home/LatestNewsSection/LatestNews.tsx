"use client";
import React from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './LatestNews.module.scss';

interface NewsItem {
  slug: string;
  title: string;
  image?: string;
  category?: string;
  isLatest?: boolean;
}

interface LatestNewsItem {
  id: string;
  category: string;
  title: string;
  image: string;
  slug: string;
}

const LatestNews: React.FC = () => {
  const { allNews, indiaNews, sportsNews, businessNews, loading } = useNewsContext();

  const getImageSrc = (img?: string): string => {
    if (!img) {
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80';
    }
    if (img.startsWith('http') || img.startsWith('data:')) {
      return img;
    }
    if (img.startsWith('/')) {
      return img;
    }
    return `/uploads/${img}`;
  };

  const displayNews: LatestNewsItem[] = React.useMemo(() => {
    const latestNews: LatestNewsItem[] = [];

    const sections = [
      { key: 'india', data: indiaNews as NewsItem[] | undefined },
      { key: 'sports', data: sportsNews as NewsItem[] | undefined },
      { key: 'business', data: businessNews as NewsItem[] | undefined },
    ];

    sections.forEach(({ key, data }) => {
      if (!data || !Array.isArray(data) || data.length === 0) return;

      const latestItems = data.filter((item) => item.isLatest === true);

      if (latestItems.length > 0) {
        const item = latestItems[0];
        latestNews.push({
          id: `${key}-${item.slug}`,
          category: item.category || key.toUpperCase(),
          title: item.title,
          image: getImageSrc(item.image),
          slug: item.slug,
        });
      }
    });

    return latestNews.slice(0, 6);
  }, [indiaNews, sportsNews, businessNews]);

  if (loading) {
    return (
      <section className={styles.latestNewsSection}>
        <div className={styles.container}>
          <div className={styles.newsGrid}>
            {[0, 1, 2].map((i) => (
              <article key={i} className={styles.newsItem}>
                <div className={`${styles.content} animate-pulse bg-gray-200 h-24 rounded`}></div>
                <div className={`${styles.imageWrapper} animate-pulse bg-gray-200 h-48 rounded`}></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayNews.length === 0) {
    return (
      <section className={styles.latestNewsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Latest News</h2>
            <div className={styles.titleUnderline}></div>
          </div>
          <p className="text-center text-gray-500 py-12">
            No breaking/latest news available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.latestNewsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Latest News</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.newsGrid}>
          {displayNews.map((item) => (
            <article key={item.id} className={styles.newsItem}>
              <div className={styles.content}>
                <span className={styles.category}>{item.category}</span>
                <h3 className={styles.newsTitle}>
                  <a href={`/news/${item.slug}`} className="hover:underline">
                    {item.title}
                  </a>
                </h3>
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded"
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>

        <div className={styles.readMoreWrapper}>
          <button className={styles.readMoreButton}>
            Read More News
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;