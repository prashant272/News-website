"use client";
import React from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './LatestNews.module.scss';

interface LatestNewsItem {
  id: string;
  category: string;
  title: string;
  image: string;
  slug: string;
}

const LatestNews: React.FC = () => {
  const { allNews, indiaNews, sportsNews, businessNews, loading } = useNewsContext();

  console.log(indiaNews,sportsNews,businessNews)

  const displayNews: LatestNewsItem[] = React.useMemo(() => {
    const latestNews: LatestNewsItem[] = [];
  
    const sections = [
      { key: 'india', data: indiaNews },
      { key: 'sports', data: sportsNews },
      { key: 'business', data: businessNews }
    ];
    
    sections.forEach(({ key, data }) => {
      if (data && Array.isArray(data) && data.length > 0) {
        const item = data[0];
        latestNews.push({
          id: `${key}-${item.slug}`,
          category: item.category || key.toUpperCase(),
          title: item.title,
          image: item.image || '',
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
            {[0,1,2].map((i) => (
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
                <h3 className={styles.newsTitle}>{item.title}</h3>
              </div>
              <div className={styles.imageWrapper}>
                <img 
                  src={item.image ? `/public/${item.image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'}
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
