'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { formatDateTime } from '@/Utils/Utils';
import styles from './EntertainmentNews.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface EntArticle {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  date?: string;
}

const getImageSrc = (img?: string): string => {
  if (!img) {
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80';
  }
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.startsWith('/') ? img : `/uploads/${img}`;
};

const Entertainment: React.FC = () => {
  const router = useRouter();
  const { entertainmentNews, loading } = useNewsContext();
  const [activeCategory, setActiveCategory] = useState('Entertainment');
  const [activeIndex, setActiveIndex] = useState(0);

  const preferredFilters = ['Entertainment', 'Bollywood', 'Hollywood', 'Others'];

  const filteredEntNews = useMemo(() => {
    if (!entertainmentNews) return [];
    const active = activeCategory.toLowerCase();

    if (active === 'entertainment') return entertainmentNews;

    if (active === 'others') {
      return entertainmentNews.filter(item => {
        const sub = (item.subCategory || '').toLowerCase();
        return !sub.includes('bollywood') && !sub.includes('hollywood');
      });
    }

    return entertainmentNews.filter(item => {
      const sub = (item.subCategory || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return sub.includes(active) || cat.includes(active);
    });
  }, [entertainmentNews, activeCategory]);

  const entArticles: EntArticle[] = useMemo(() => {
    if (!filteredEntNews.length) return [];
    
    // filteredEntNews is already sorted by date in NewsContext
    return filteredEntNews.slice(0, 5).map((item, index) => ({
      id: `ent-${item.slug}-${index}`,
      slug: item.slug,
      title: item.title,
      image: getImageSrc(item.image),
      category: item.subCategory || item.category || 'Entertainment',
      date: item.publishedAt || item.date || item.createdAt,
    }));
  }, [filteredEntNews]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const getHref = (article: EntArticle) => {
    const sub = (article.category || 'general').toLowerCase().trim();
    return `/Pages/entertainment/${sub}/${article.slug}`;
  };

  if (loading && entArticles.length === 0) {
    return (
      <section className={styles.entSection}>
        <div className={styles.container}>
           <div className="animate-pulse bg-gray-100 h-10 w-48 rounded-lg mb-10"></div>
          <div className="animate-pulse bg-gray-100 h-96 rounded-3xl"></div>
        </div>
      </section>
    );
  }

  const featured = entArticles[activeIndex];

  return (
    <section className={styles.entSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.dot}></span>
            <h2 className={styles.title}>Today's Entertainment</h2>
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
          {entArticles.length > 0 ? (
            <div className={styles.spotlightLayout}>
              {/* Left Spotlight */}
              <div className={styles.spotlightFeatured}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featured.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className={styles.featuredBox}
                  >
                    <Link href={getHref(featured)} className={styles.featuredLink}>
                      <div className={styles.featuredImg}>
                        <img src={featured.image} alt={featured.title} />
                        <div className={styles.glassOverlay}>
                          <span className={styles.badge}>{featured.category}</span>
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

              {/* Right Grid */}
              <div className={styles.entGrid}>
                {entArticles.map((article, index) => (
                  <div
                    key={article.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`${styles.smallCard} ${activeIndex === index ? styles.activeCard : ''}`}
                  >
                    <Link href={getHref(article)} className={styles.cardLink}>
                      <div className={styles.cardImg}>
                        <img src={article.image} alt={article.title} />
                      </div>
                      <div className={styles.cardInfo}>
                        <span className={styles.smallBadge}>{article.category}</span>
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
              <p>No {activeCategory} news found at the moment.</p>
            </div>
          )}
        </div>

        {entArticles.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.viewMore} onClick={() => router.push('/Pages/entertainment')}>
              More Entertainment
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Entertainment;
