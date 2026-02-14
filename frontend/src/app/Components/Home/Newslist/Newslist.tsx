"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { useActiveAds } from '@/app/hooks/useAds'; 
import styles from './Newslist.module.scss';


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

  const { data: adsData, loading: adsLoading } = useActiveAds();
  const activeAds = (adsData || []).filter(ad => ad.isActive);

  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length <= 1) return;

    const interval = setInterval(() => {
      setAdIndex(prev => (prev + 1) % activeAds.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeAds.length]);

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

    const filteredNews = allNews.filter((item) => item.isLatest !== true);

    const grouped = new Map<string, RawNewsItem[]>();

    for (const item of filteredNews) {
      const cat = item.category || 'Uncategorized';
      if (!grouped.has(cat)) {
        grouped.set(cat, []);
      }
      grouped.get(cat)!.push(item as RawNewsItem);
    }

    const selected: RawNewsItem[] = [];
    const categories = Array.from(grouped.keys());

    for (let i = 0; i < Math.min(categories.length, 6); i++) {
      const categoryItems = grouped.get(categories[i])!;
      if (categoryItems.length > 0) {
        selected.push(categoryItems[0]);
      }
    }

    const articles: NewsArticle[] = selected.map((item, idx) => ({
      id: `div-${item.slug}-${idx}`,
      category: item.category,
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

    return allNews
      .filter((item) => item.isTrending === true)
      .slice(0, 5)
      .map((item, index) => ({
        id: `${index}-${item.slug}`,
        title: item.title,
        image: getImageSrc(item.image),
        slug: item.slug,
        category: item.category,
        subCategory: item.subCategory,
      }));
  }, [allNews]);

  const renderAd = () => {
    if (adsLoading) {
      return (
        <div className={styles.adPlaceholder}>
          <span>Loading advertisement...</span>
        </div>
      );
    }

    if (activeAds.length === 0) {
      return (
        <div className={styles.adPlaceholder}>
          <div className={styles.emptyAdBox}>
            <span>AD SPACE</span>
            <small>Will adjust to image size</small>
          </div>
        </div>
      );
    }

    const currentAd = activeAds[adIndex % activeAds.length];

    return (
      <div className={styles.adWrapper}>
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adLink}
        >
          <img
            src={currentAd.imageUrl}
            alt={currentAd.title || "Advertisement"}
            className={styles.adImage}
            loading="lazy"
          />
        </a>

        {activeAds.length > 1 && (
          <div className={styles.adDots}>
            {activeAds.map((_, i) => (
              <button
                key={i}
                onClick={() => setAdIndex(i)}
                className={`${styles.dot} ${i === adIndex % activeAds.length ? styles.activeDot : ''}`}
                aria-label={`Ad ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

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

          <div className={styles.adSpace}>
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            {renderAd()}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default NewsList;
