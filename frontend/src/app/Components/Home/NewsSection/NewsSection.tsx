"use client";
import React, { useMemo } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './NewsSection.module.scss';

interface NewsItem {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  category?: string;
  tags?: string[];
}

interface DisplayNewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  isLive: boolean;
  isVideo: boolean;
}

const NewsSection: React.FC = () => {
  const { indiaNews, loading } = useNewsContext();

  const liveNews = useMemo(() => {
    if (!indiaNews) return [];
    
    return indiaNews
      .filter(item => 
        item.tags?.includes('live') || 
        item.tags?.includes('fresh') ||
        item.tags?.includes('breaking')
      )
      .slice(0, 4)
      .map((item, index) => ({
        id: item.slug,
        title: item.title,
        description: item.summary || item.content?.substring(0, 100) + '...',
        image: item.image ? `/public/${item.image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        category: item.category || 'Breaking News',
        isLive: index === 0 || item.tags?.includes('live'),
        isVideo: item.tags?.includes('video') || index === 3,
      }));
  }, [indiaNews]);

  if (loading || liveNews.length === 0) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.secondaryGrid}>
            {Array(4).fill(0).map((_, i) => (
              <article key={i} className={`${styles.secondaryArticle} animate-pulse`}>
                <div className="bg-gray-200 h-32 w-full rounded"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const mainArticle = liveNews[0];
  const secondaryArticles = liveNews.slice(1);

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <article className={styles.mainArticle}>
          <div className={styles.imageWrapper}>
            <img src={mainArticle.image} alt={mainArticle.title} />
            <div className={styles.overlay}>
              <span className={styles.liveBadge}>
                <span className={styles.liveDot}></span>
                LIVE
              </span>
              <span className={styles.category}>{mainArticle.category}</span>
            </div>
          </div>
          <div className={styles.mainContent}>
            <h1 className={styles.mainTitle}>{mainArticle.title}</h1>
            <p className={styles.mainDescription}>{mainArticle.description}</p>
            <div className={styles.metadata}>
              <span className={styles.timestamp}>Updated 45 mins ago</span>
              <button className={styles.readMore}>
                Read Full Story
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </article>

        <div className={styles.secondaryGrid}>
          {secondaryArticles.map((item) => (
            <article key={item.id} className={styles.secondaryArticle}>
              <div className={styles.secondaryImage}>
                <img src={item.image} alt={item.title} />
                {item.isLive && (
                  <span className={styles.liveTag}>
                    <span className={styles.pulseDot}></span>
                    LIVE
                  </span>
                )}
                {item.isVideo && (
                  <div className={styles.playButton}>
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="16" r="16" fill="rgba(255, 255, 255, 0.95)" />
                      <path d="M12 9L23 16L12 23V9Z" fill="#000" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={styles.secondaryContent}>
                <h3 className={styles.secondaryTitle}>{item.title}</h3>
                <p className={styles.secondaryDescription}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
