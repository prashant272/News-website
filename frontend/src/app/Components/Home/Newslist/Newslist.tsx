"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './Newslist.module.scss';
import SidebarAds from '../../Common/SidebarAds/SidebarAds';


interface RawNewsItem {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  category: string;
  subCategory?: string;
  tags?: string[];
  isTrending?: boolean;
  isLatest?: boolean;
}


interface NewsArticle {
  id: string;
  category: string;
  subCategory?: string;
  title: string;
  image: string;
  slug: string;
  isOpinion: boolean;
  isVideo: boolean;
}


interface TrendingItem {
  id: string;
  title: string;
  image: string;
  slug: string;
  category: string;
  subCategory?: string;
}


const NewsList: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const router = useRouter();



  const getImageSrc = (img?: string): string => {
    if (!img) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
    return `/uploads/${img}`;
  };

  const handleCardClick = (slug: string, category: string, subCategory?: string) => {
    const cat = category || 'news';
    const subCat = subCategory || 'general';
    router.push(`/Pages/${cat}/${subCat}/${slug}`);
  };

  const newsArticles: NewsArticle[] = useMemo(() => {
    if (!allNews || allNews.length === 0) return [];

    // Sort by most recent (latest and trending first, then by index)
    const sortedNews = [...allNews].sort((a, b) => {
      if (a.isLatest && !b.isLatest) return -1;
      if (!a.isLatest && b.isLatest) return 1;
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      return 0;
    });

    // Take top 18 items to fill the 3-column grid (covers user's 15-20 range)
    const selected = sortedNews.slice(0, 21);

    const articles: NewsArticle[] = selected.map((item, idx) => ({
      id: `div-${item.slug}-${idx}`,
      category: item.category || 'News',
      subCategory: item.subCategory,
      title: item.title,
      image: getImageSrc(item.image),
      slug: item.slug,
      isOpinion: item.tags?.includes('opinion') ?? false,
      isVideo: item.tags?.includes('video') ?? false,
    }));

    return articles;
  }, [allNews]);

  const trendingItems: TrendingItem[] = useMemo(() => {
    if (!allNews) return [];

    const trending = allNews.filter((item) => item.isTrending === true);
    const fallback = allNews.slice(0, 12);
    const finalTrending = trending.length >= 6 ? trending : fallback;

    return finalTrending
      .slice(0, 12)

      .map((item, index) => ({
        id: `${index}-${item.slug}`,
        title: item.title,
        image: getImageSrc(item.image),
        slug: item.slug,
        category: item.category,
        subCategory: item.subCategory,
      }));
  }, [allNews]);



  if (loading) {
    return (
      <section className={styles.newsListSection}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <div className={styles.newsGrid}>
              {Array(6).fill(0).map((_, i) => (
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
            {newsArticles.length === 0 ? (
              <p>No recent news available</p>
            ) : (
              newsArticles.map((article) => (
                <article
                  key={article.id}
                  className={styles.newsCard}
                  onClick={() => handleCardClick(article.slug, article.category, article.subCategory)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.cardImage}>
                    <img src={article.image} alt={article.title} />
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
              ))
            )}
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
                <article
                  key={item.id}
                  className={styles.trendingCard}
                  onClick={() => handleCardClick(item.slug, item.category, item.subCategory)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.trendingRank}>
                    <span>{index + 1}</span>
                  </div>
                  <div className={styles.trendingImage}>
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  </div>
                  <h4 className={styles.trendingText}>{item.title}</h4>
                </article>
              ))}
            </div>
          </div>

          <SidebarAds count={5} />
        </aside>
      </div>
    </section>
  );
};

export default NewsList;
