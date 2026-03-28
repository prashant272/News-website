"use client";
import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { useActiveAds } from '@/app/hooks/useAds';
import { formatDateTime } from '@/Utils/Utils';
import styles from './Newslist.module.scss';

interface NewsArticle {
  id: string;
  category: string;
  subCategory?: string;
  title: string;
  image: string;
  slug: string;
  isOpinion: boolean;
  isVideo: boolean;
  date?: string;
  nominationLink?: string;
  moreInfoLink?: string;
}

interface TrendingItem {
  id: string;
  title: string;
  image: string;
  slug: string;
  category: string;
  subCategory?: string;
  date?: string;
}

const NewsList: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const [visibleCount, setVisibleCount] = useState(10);
  const [visibleTrending, setVisibleTrending] = useState(6);
  const router = useRouter();

  const getImageSrc = (img?: string): string => {
    if (!img) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
    if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) return img;
    return `/uploads/${img}`;
  };

  const { sortedNews, hasMore } = useMemo(() => {
    if (!allNews) return { sortedNews: [], hasMore: false };

    const sorted = [...allNews].sort((a, b) => {
      const getSafeTime = (item: any) => {
        const d = new Date(item.publishedAt || item.date || item.createdAt || 0);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return getSafeTime(b) - getSafeTime(a);
    });

    // Skip first 10 (Hero/Latest) and take visibleCount
    const newsForGrid = sorted.slice(6, 6 + visibleCount);
    const moreAvailable = (6 + visibleCount) < sorted.length;

    return { sortedNews: newsForGrid, hasMore: moreAvailable };
  }, [allNews, visibleCount]);

  const newsArticles: NewsArticle[] = useMemo(() => {
    return sortedNews.map((item, idx) => ({
      id: `list-${item.slug}-${idx}`,
      category: item.category || 'News',
      subCategory: item.subCategory,
      title: item.title,
      image: getImageSrc(item.image),
      slug: item.slug,
      isOpinion: item.tags?.includes('opinion') ?? false,
      isVideo: item.tags?.includes('video') ?? false,
      date: item.publishedAt || item.date || item.createdAt,
      nominationLink: item.nominationLink,
      moreInfoLink: item.moreInfoLink,
    }));
  }, [sortedNews]);

  const { trendingItems, hasMoreTrending } = useMemo(() => {
    if (!allNews) return { trendingItems: [], hasMoreTrending: false };

    // Independent of the left grid (removed exclusion)
    const trending = allNews.filter((item) => item.isTrending === true);
    const fallback = allNews.slice(0, 30);
    const pool = trending.length >= 5 ? trending : fallback;

    const displayed = pool.slice(0, visibleTrending);
    const moreAvailable = visibleTrending < pool.length;

    return {
      trendingItems: displayed.map((item, index) => ({
        id: `trend-${index}-${item.slug}`,
        title: item.title,
        image: getImageSrc(item.image),
        slug: item.slug,
        category: item.category,
        subCategory: item.subCategory,
        date: item.publishedAt || item.date || item.createdAt,
      })),
      hasMoreTrending: moreAvailable
    };
  }, [allNews, visibleTrending]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  const handleShowMoreTrending = () => {
    setVisibleTrending(prev => prev + 6);
  };

  if (loading) {
    return (
      <section className={styles.newsListSection}>
        <div className={styles.container}>
          <div className={styles.mainContent}>
            <div className={styles.newsList}>
              {Array(10).fill(0).map((_, i) => (
                <div key={i} className={`${styles.loadingCard} animate-pulse`}></div>
              ))}
            </div>

            {hasMoreTrending && (
              <div className={styles.trendingMoreWrapper}>
                <button className={styles.trendingMore} onClick={handleShowMoreTrending}>
                  Show More Trends ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.newsListSection}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.sectionHeader}>
            <span className={styles.dot}></span>
            <h2 className={styles.title}>Recent News</h2>
          </div>
          <div className={styles.newsList}>
            {newsArticles.length === 0 ? (
              <p className={styles.noNews}>No recent news available</p>
            ) : (
              newsArticles.map((article) => {
                const url = `/Pages/${article.category || 'news'}/${article.subCategory || 'general'}/${article.slug}`;
                return (
                  <Link
                    key={article.id}
                    href={url}
                    className={styles.newsCard}
                  >
                    <div className={styles.cardImage}>
                      <img src={article.image} alt={article.title} loading="lazy" />
                      {article.isVideo && (
                        <div className={styles.playBtn}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M5 3L19 12L5 21V3Z" fill="white" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <span className={styles.categoryBadge}>{article.category}</span>
                      <h3 className={styles.cardTitle}>{article.title}</h3>
                      {article.date && (
                        <span className={styles.date}>{formatDateTime(article.date)}</span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {hasMore && (
            <div className={styles.loadMoreWrapper}>
              <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                Explore More News
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.trendingSection}>
            <div className={styles.trendingHeader}>
              <h2 className={styles.trendingTitle}>Trending</h2>
              <div className={styles.trendingAccent}></div>
            </div>

            <div className={styles.trendingList}>
              {trendingItems.map((item, index) => {
                const url = `/Pages/${item.category || 'news'}/${item.subCategory || 'general'}/${item.slug}`;
                const adToInsert = (index + 1) % 3 === 0;

                return (
                  <React.Fragment key={item.id}>
                    <Link
                      href={url}
                      className={styles.trendingCard}
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
                      <div className={styles.trendingInfo}>
                        <h4 className={styles.trendingText}>{item.title}</h4>
                        {item.date && (
                          <span className={styles.trendingDate}>{formatDateTime(item.date)}</span>
                        )}
                      </div>
                    </Link>
                    {adToInsert && <TrendingAdUnit key={`ad-${index}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            {hasMoreTrending && (
              <button className={styles.trendingMore} onClick={handleShowMoreTrending}>
                Show More Trends ↓
              </button>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

/* --- Internal Ad Component --- */
const TrendingAdUnit: React.FC = () => {
  const { data: ads } = useActiveAds();
  const sidebarAds = (ads || []).filter(ad => ad.isActive && (ad.sidebarImageUrl || ad.placement === 'sidebar'));
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (sidebarAds.length <= 1) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % sidebarAds.length);
    }, 5000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [sidebarAds.length]);

  if (sidebarAds.length === 0) return null;

  const currentAd = sidebarAds[adIndex];

  return (
    <div className={styles.adCard}>
      <span className={styles.adTag}>ADVERTISEMENT</span>
      <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className={styles.adLink}>
        <img src={currentAd.sidebarImageUrl || currentAd.imageUrl} alt="Ad" />
      </a>
    </div>
  );
};

export default NewsList;
