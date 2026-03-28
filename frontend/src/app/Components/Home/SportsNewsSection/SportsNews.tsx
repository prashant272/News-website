'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { formatDateTime } from '@/Utils/Utils';
import styles from './SportsNews.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface SportsArticle {
  id: string;
  slug: string;
  title: string;
  image: string;
  subCategory: string;
  date?: string;
}

const SportsNews: React.FC = () => {
  const { sportsNews, loading } = useNewsContext();
  const [activeCategory, setActiveCategory] = useState('Sports');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const preferredFilters = ['Sports', 'Cricket', 'Football', 'Others'];

  const getImageSrc = (img?: string): string => {
    if (!img) return 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.startsWith('/') ? img : `/uploads/${img}`;
  };

  const filteredSportsNews = useMemo(() => {
    if (!sportsNews) return [];
    const active = activeCategory.toLowerCase();

    if (active === 'sports') return sportsNews;

    if (active === 'others') {
      return sportsNews.filter(item => {
        const sub = (item.subCategory || '').toLowerCase();
        return !sub.includes('cricket') && !sub.includes('football');
      });
    }

    return sportsNews.filter(item => {
      const sub = (item.subCategory || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return sub.includes(active) || cat.includes(active);
    });
  }, [sportsNews, activeCategory]);

  const sportsArticles: SportsArticle[] = useMemo(() => {
    if (!filteredSportsNews.length) return [];
    
    // filteredSportsNews is already sorted by date in NewsContext
    return filteredSportsNews.slice(0, 5).map((item, index) => ({
      id: `sports-${item.slug}-${index}`,
      slug: item.slug,
      title: item.title,
      image: getImageSrc(item.image),
      subCategory: item.subCategory || item.category || 'Sports',
      date: item.publishedAt || item.date || item.createdAt,
    }));
  }, [filteredSportsNews]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const getHref = (article: SportsArticle) => {
    const sub = (article.subCategory || 'general').toLowerCase().trim();
    return `/Pages/sports/${encodeURIComponent(sub)}/${article.slug}`;
  };

  if (loading && sportsArticles.length === 0) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
             <div className="animate-pulse bg-gray-100 h-10 w-48 rounded-lg"></div>
          </div>
          <div className="animate-pulse bg-gray-100 h-96 rounded-3xl mt-10"></div>
        </div>
      </section>
    );
  }

  const featured = sportsArticles[activeIndex];

  return (
    <section className={styles.sportsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.dot}></span>
            <h2 className={styles.title}>Sports Arena</h2>
          </div>
          <nav className={styles.categoryNav}>
            {preferredFilters.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${activeCategory === category ? styles.active : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.articlesContainer}>
          {sportsArticles.length > 0 ? (
            <div className={styles.spotlightLayout}>
              {/* Left Spotlight: Featured Image */}
              <div className={styles.spotlightFeatured}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featured.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.featuredBox}
                  >
                    <Link href={getHref(featured)} className={styles.featuredLink}>
                      <div className={styles.featuredImg}>
                        <Image 
                          src={featured.image}
                          alt={featured.title}
                          fill
                          priority={activeIndex === 0}
                          className={styles.spotlightImg}
                        />
                        <div className={styles.glassOverlay}>
                          <span className={styles.badge}>{featured.subCategory}</span>
                          <h3 className={styles.featuredTitle}>{featured.title}</h3>
                          {featured.date && (
                            <p className={styles.dateText}>{formatDateTime(featured.date)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Grid: Interactive Thumbnails */}
              <div className={styles.sportsGrid}>
                {sportsArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`${styles.smallCard} ${activeIndex === index ? styles.activeCard : ''}`}
                  >
                    <Link href={getHref(article)} className={styles.cardLink}>
                      <div className={styles.cardImg}>
                        <Image 
                          src={article.image}
                          alt={article.title}
                          fill
                          className={styles.thumbImg}
                        />
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.smallBadge}>{article.subCategory}</span>
                        <h4 className={styles.smallTitle}>{article.title}</h4>
                        {article.date && (
                          <p className={styles.smallDate}>{formatDateTime(article.date)}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.noData}>
              <p>Fetching the latest sports action...</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.viewMore} onClick={() => router.push('/Pages/sports')}>
            Full Sports Coverage
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SportsNews;
