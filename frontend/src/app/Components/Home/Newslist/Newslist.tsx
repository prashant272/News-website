"use client";
import React, { useMemo } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './Newslist.module.scss';

interface RawNewsItem {
  slug: string;
  title: string;
  summary?: string;
  image?: string;
  category: string;
  tags?: string[];
}

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  image: string;
  isOpinion: boolean;
  isVideo: boolean;
}


interface TrendingItem {
  id: string;
  title: string;
  image: string;
}

const NewsList: React.FC = () => {
  const { allNews, loading } = useNewsContext();

  const newsArticles: NewsArticle[] = useMemo(() => {
    if (!allNews) return [];
    
    const sectionArticles: { [key: string]: RawNewsItem[] } = {};
    
    allNews.forEach(item => {
      const section = item.category.toLowerCase();
      if (!sectionArticles[section]) sectionArticles[section] = [];
      sectionArticles[section].push(item);
    });
    
    const articles: NewsArticle[] = [];
    
    Object.entries(sectionArticles).forEach(([section, items]) => {
      items.slice(0, 2).forEach((item, idx) => {
     articles.push({
  id: `${section}-${item.slug}-${idx}`,
  category: item.category,
  title: item.title,
  image: item.image || '',
  isOpinion: item.tags?.includes('opinion') ?? false,
  isVideo: item.tags?.includes('video') ?? false,
});
;
      });
    });
    
    return articles.slice(0, 12);
  }, [allNews]);

  const trendingItems: TrendingItem[] = useMemo(() => {
    if (!allNews) return [];
    
    return allNews
      .filter(item => item.tags?.includes('trending'))
      .slice(0, 5)
      .map((item, index) => ({
        id: `${index}-${item.slug}`,
        title: item.title,
        image: item.image || '',
      }));
  }, [allNews]);

  if (loading) {
    return (
      <section className={styles.newsListSection}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <div className={styles.newsGrid}>
              {Array(8).fill(0).map((_, i) => (
                <article key={i} className={`${styles.newsCard} animate-pulse`}>
                  <div className="bg-gray-200 h-40 w-full rounded"></div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <aside className={styles.sidebar}>
            <div className={`${styles.trendingSection} animate-pulse`}>
              <div className="h-8 bg-gray-200 w-32 rounded mb-6"></div>
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsListSection}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.newsGrid}>
            {newsArticles.map((article) => (
              <article key={article.id} className={styles.newsCard}>
                <div className={styles.cardImage}>
                  <img 
                    src={article.image ? `/public/${article.image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'}
                    alt={article.title}
                  />
                  {article.isVideo && (
                    <div className={styles.videoIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="rgba(255, 68, 68, 0.95)" />
                        <path d="M9 6L17 12L9 18V6Z" fill="#fff" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <span className={styles.categoryBadge}>{article.category}</span>
                    {article.isOpinion && (
                      <span className={styles.opinionBadge}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        OPINION
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{article.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.trendingSection}>
            <div className={styles.trendingHeader}>
              <h2 className={styles.trendingTitle}>Trending</h2>
              <div className={styles.trendingAccent}></div>
            </div>
            
            <div className={styles.trendingList}>
              {trendingItems.map((item, index) => (
                <article key={item.id} className={styles.trendingCard}>
                  <div className={styles.trendingRank}>
                    <span>{index + 1}</span>
                  </div>
                  <div className={styles.trendingImage}>
                    <img 
                      src={item.image ? `/public/${item.image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'}
                      alt={item.title}
                    />
                  </div>
                  <h4 className={styles.trendingText}>{item.title}</h4>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.adSpace}>
            <div className={styles.adContent}>
              <span className={styles.adLabel}>ADVERTISEMENT</span>
              <div className={styles.adPlaceholder}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" stroke="rgba(255, 153, 0, 0.3)" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="40" y="45" textAnchor="middle" fill="rgba(255, 153, 0, 0.5)" fontSize="12" fontWeight="600">AD SPACE</text>
                </svg>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NewsList;
