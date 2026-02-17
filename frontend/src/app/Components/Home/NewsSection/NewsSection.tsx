"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './NewsSection.module.scss';

interface NewsItem {
  slug: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  tags?: string[];
  isLatest?: boolean;
  isTrending?: boolean;
  _id?: string;
}

interface DisplayNewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  subCategory?: string;
  slug: string;
  isVideo: boolean;
  targetLink?: string;
  nominationLink?: string;
}

const NewsSection: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const router = useRouter();

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

  const handleCardClick = (item: DisplayNewsItem) => {
    const category = item.category || 'news';
    const subCategory = item.subCategory || 'general';
    const slug = item.slug;

    router.push(`/Pages/${category}/${subCategory}/${slug}`);
  };

  const liveNews = useMemo(() => {
    if (!allNews || loading) return [];

    return allNews
      .filter((item) => item.isLatest === true)
      .map((item) => ({
        id: item.slug || item._id || `item-${Math.random().toString(36).slice(2, 9)}`,
        title: item.title,
        description: item.summary || (item.content ? item.content.substring(0, 150) + '...' : ''),
        image: getImageSrc(item.image),
        category: item.category || 'Breaking News',
        subCategory: item.subCategory || 'General',
        slug: item.slug,
        isVideo: item.tags?.includes('video') || false,
        targetLink: (item as any).targetLink,
        nominationLink: (item as any).nominationLink,
      }))
      .slice(0, 4);
  }, [allNews, loading]);

  if (loading) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.newsGrid}>
            {/* Featured skeleton */}
            <div className={`${styles.loadingCard} ${styles.featuredArticle}`}>
              <div className={`${styles.loadingSkeleton}`} style={{ height: '400px' }}></div>
              <div style={{ padding: '2.5rem' }}>
                <div className={`${styles.loadingSkeleton}`} style={{ height: '32px', width: '80%', marginBottom: '1rem', borderRadius: '8px' }}></div>
                <div className={`${styles.loadingSkeleton}`} style={{ height: '20px', width: '60%', borderRadius: '8px' }}></div>
              </div>
            </div>

            {/* Card skeletons */}
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className={styles.loadingCard}>
                <div className={`${styles.loadingSkeleton}`} style={{ height: '240px' }}></div>
                <div style={{ padding: '1.75rem' }}>
                  <div className={`${styles.loadingSkeleton}`} style={{ height: '24px', width: '90%', marginBottom: '0.75rem', borderRadius: '6px' }}></div>
                  <div className={`${styles.loadingSkeleton}`} style={{ height: '16px', width: '70%', borderRadius: '6px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (liveNews.length === 0) {
    return (
      <section className={styles.newsSection}>
        <div className={styles.container}>
          <div className={styles.newsGrid}>
            <div className={styles.noLive}>
              <h3>No live updates right now</h3>
              <p>Check back later for breaking news and live coverage.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredArticle = liveNews[0];
  const regularArticles = liveNews.slice(1);

  return (
    <section className={styles.newsSection}>
      <div className={styles.container}>
        <div className={styles.newsGrid}>
          {/* Featured Hero Article */}
          <article
            className={styles.featuredArticle}
            onClick={() => handleCardClick(featuredArticle)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.featuredImage}>
              <img src={featuredArticle.image} alt={featuredArticle.title} loading="eager" />
              <div className={styles.overlay}>
                <span className={styles.category}>{featuredArticle.category}</span>
              </div>
            </div>
            <div className={styles.featuredContent}>
              <h1 className={styles.featuredTitle}>{featuredArticle.title}</h1>
              <p className={styles.featuredDescription}>{featuredArticle.description}</p>

              {(featuredArticle.category?.toUpperCase() === "AWARDS" || featuredArticle.category?.toLowerCase() === "awards") && (
                <div className={styles.awardActions}>
                  {featuredArticle.targetLink && (
                    <a
                      href={featuredArticle.targetLink.startsWith('http') ? featuredArticle.targetLink : `https://${featuredArticle.targetLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.moreInfoBtn}
                      onClick={(e) => e.stopPropagation()}
                    >
                      More Info
                    </a>
                  )}
                  {featuredArticle.nominationLink && (
                    <a
                      href={featuredArticle.nominationLink.startsWith('http') ? featuredArticle.nominationLink : `https://${featuredArticle.nominationLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.nominationBtn}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Nomination
                    </a>
                  )}
                </div>
              )}

              <button
                className={styles.readMore}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(featuredArticle);
                }}
              >
                Read Full Story
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </article>

          {/* Regular Article Cards */}
          {regularArticles.map((item) => (
            <article
              key={item.id}
              className={styles.articleCard}
              onClick={() => handleCardClick(item)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardImage}>
                <img src={item.image} alt={item.title} loading="lazy" />
                {item.isVideo && (
                  <>
                    <div className={styles.liveTag}>
                      <span className={styles.pulseDot}></span>
                      Live
                    </div>
                    <div className={styles.playButton}>
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <circle cx="28" cy="28" r="28" fill="rgba(255, 255, 255, 0.98)" />
                        <path d="M22 16L40 28L22 40V16Z" fill="#3b82f6" />
                      </svg>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>

                {(item.category?.toUpperCase() === "AWARDS" || item.category?.toLowerCase() === "awards") && (
                  <div className={styles.awardActions}>
                    {item.targetLink && (
                      <a
                        href={item.targetLink.startsWith('http') ? item.targetLink : `https://${item.targetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.moreInfoBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Info
                      </a>
                    )}
                    {item.nominationLink && (
                      <a
                        href={item.nominationLink.startsWith('http') ? item.nominationLink : `https://${item.nominationLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.nominationBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Nominate
                      </a>
                    )}
                  </div>
                )}

                <div className={styles.cardMeta}>
                  <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6' }}>
                    {item.category}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
