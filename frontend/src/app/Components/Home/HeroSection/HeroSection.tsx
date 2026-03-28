"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroSection.module.scss';

const HeroSection: React.FC = () => {
  const { allNews, loading: contextLoading } = useNewsContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoCycleRef = useRef<NodeJS.Timeout | null>(null);

  // Use news from context (already pre-sorted in NewsContext)
  const news = useMemo(() => {
    if (!allNews) return [];
    return allNews.filter(item => item.image).slice(0, 7);
  }, [allNews]);

  const startAutoCycle = () => {
    if (autoCycleRef.current) clearInterval(autoCycleRef.current);
    autoCycleRef.current = setInterval(() => {
      setCurrentIndex((prev) => (news.length > 0 ? (prev + 1) % news.length : 0));
    }, 120000); // 2 minutes
  };

  useEffect(() => {
    if (news.length > 0) {
      startAutoCycle();
    }
    return () => {
      if (autoCycleRef.current) clearInterval(autoCycleRef.current);
    };
  }, [news]);

  if (contextLoading && news.length === 0) {
    return (
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.mainFeatured} style={{ background: '#eee', borderRadius: '28px' }}>
            <div className={styles.heroLoader}><div className={styles.spinner}></div></div>
          </div>
          <div className={styles.sideBar}>
             <div className="animate-pulse bg-gray-100 h-96 rounded-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  const featured = news[currentIndex];

  const getNewsUrl = (item: any) => {
    const category = (item.category || 'news').toLowerCase().trim();
    const subCategory = (item.subCategory || 'general').toLowerCase().trim();
    return `/Pages/${category}/${subCategory}/${item.slug}`;
  };

  const getImageSrc = (img?: string): string => {
    if (!img) return '/placeholder-news.jpg';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return img.startsWith('/') ? img : `/uploads/${img}`;
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        {/* Left: Featured Large Container */}
        <div className={styles.mainFeatured}>
          <AnimatePresence mode="wait">
            <motion.div
              key={featured._id || featured.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={styles.featuredWrapper}
            >
              <Image 
                src={getImageSrc(featured.image)}
                alt={featured.title}
                fill
                priority={true}
                className={styles.heroImg}
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
              <div className={styles.overlay} />
              
              <div className={styles.content}>
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.category}
                >
                  {featured.category}
                </motion.span>
                
                <Link href={getNewsUrl(featured)} className={styles.titleLink}>
                  <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.title}
                  >
                    {featured.title}
                  </motion.h1>
                </Link>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={styles.summary}
                >
                  {featured.summary || (featured.content ? featured.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : '')}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={styles.actions}
                >
                  <Link href={getNewsUrl(featured)} className={styles.readMoreBtn}>
                    Read Full Story <ChevronRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Side Headlines Sidebar */}
        <div className={styles.sideBar}>
          <div className={styles.sideHeader}>
            <span className={styles.pulseDot}></span>
            <h3>Latest Headlines</h3>
          </div>
          <div className={styles.sideList}>
            {news
              .filter((item) => item.slug !== featured.slug)
              .slice(0, 4)
              .map((item) => {
                const globalIndex = news.findIndex(n => n.slug === item.slug);
                return (
                  <div 
                    key={item._id || item.slug} 
                    className={styles.sideCard}
                  >
                    <div 
                      className={styles.thumb} 
                      onMouseEnter={() => {
                        setCurrentIndex(globalIndex);
                        startAutoCycle();
                      }}
                      onClick={() => {
                        setCurrentIndex(globalIndex);
                        startAutoCycle();
                      }}
                    >
                      <Image 
                        src={getImageSrc(item.image)}
                        alt={item.title}
                        fill
                        className={styles.smallImg}
                        sizes="120px"
                      />
                    </div>
                    <Link href={getNewsUrl(item)} className={styles.sideInfo}>
                      <span className={styles.sideCategory}>{item.category}</span>
                      <h4 className={styles.sideNewsTitle}>{item.title}</h4>
                    </Link>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
