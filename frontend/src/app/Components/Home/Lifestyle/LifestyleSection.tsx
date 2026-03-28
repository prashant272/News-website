'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { formatDateTime } from '@/Utils/Utils';
import styles from './LifestyleSection.module.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface LifestyleArticle {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  date?: string;
}

const LifestyleSection: React.FC = () => {
  const { lifestyleNews, loading } = useNewsContext();
  const [activeCategory, setActiveCategory] = useState('Lifestyle');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const preferredFilters = ['Lifestyle', 'Fashion', 'Culture', 'Shopping', 'Others'];

  const getImageSrc = (img?: string): string => {
    if (!img) return 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800&q=80';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.startsWith('/') ? img : `/uploads/${img}`;
  };

  const filteredLifestyleNews = useMemo(() => {
    if (!lifestyleNews) return [];
    const active = activeCategory.toLowerCase();
    if (active === 'lifestyle') return lifestyleNews;

    if (active === 'others') {
      return lifestyleNews.filter(item => {
        const sub = (item.subCategory || '').toLowerCase();
        return !sub.includes('fashion') && !sub.includes('culture') && !sub.includes('shopping');
      });
    }

    return lifestyleNews.filter(item => {
      const sub = (item.subCategory || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return sub.includes(active) || cat.includes(active);
    });
  }, [lifestyleNews, activeCategory]);

  const lifestyleArticles: LifestyleArticle[] = useMemo(() => {
    if (!filteredLifestyleNews.length) return [];
    
    // filteredLifestyleNews is already sorted by date in NewsContext
    return filteredLifestyleNews.slice(0, 5).map((item, index) => ({
      id: `life-${item.slug}-${index}`,
      slug: item.slug,
      title: item.title,
      image: getImageSrc(item.image),
      category: item.subCategory || item.category || 'Lifestyle',
      date: item.publishedAt || item.date || item.createdAt,
    }));
  }, [filteredLifestyleNews]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const getHref = (article: LifestyleArticle) => {
    const sub = (article.category || 'general').toLowerCase().trim();
    return `/Pages/lifestyle/${encodeURIComponent(sub)}/${article.slug}`;
  };

  if (loading && lifestyleArticles.length === 0) {
    return (
      <section className={styles.lifestyleSection}>
        <div className={styles.container}>
          <div className="animate-pulse bg-gray-100 h-10 w-48 rounded-lg mb-10"></div>
          <div className="animate-pulse bg-gray-100 h-96 rounded-3xl"></div>
        </div>
      </section>
    );
  }

  const featured = lifestyleArticles[activeIndex];

  return (
    <section className={styles.lifestyleSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.dot}></span>
            <h2 className={styles.title}>Lifestyle & Culture</h2>
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
          {lifestyleArticles.length > 0 ? (
            <div className={styles.spotlightLayout}>
              {/* Left Spotlight */}
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
                          className={styles.spotlightImg}
                        />
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
              <div className={styles.lifeGrid}>
                {lifestyleArticles.map((article, index) => (
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
              <p>Polishing the latest lifestyle trends for you...</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.viewMore} onClick={() => router.push('/Pages/lifestyle')}>
            Explore More Trends
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;