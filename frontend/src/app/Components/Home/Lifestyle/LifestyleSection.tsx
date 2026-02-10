"use client";
import React, { useState, useMemo } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './LifestyleSection.module.scss';

interface RawLifestyleItem {
  slug: string;
  title: string;
  image?: string;
  category: string;
  tags?: string[];
  subCategory?: string;
}

interface LifestyleArticle {
  id: string;
  category: string;
  title: string;
  image: string;
}

const categories = ['Food', 'Travel', 'Beauty', 'Photos', 'Web Stories', 'Video', 'Spirituality', 'Events'];

const LifestyleSection: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const [activeTab, setActiveTab] = useState('Food');

  const lifestyleNews = useMemo(() => {
    if (!allNews) return [];
    
    return allNews.filter(item => 
      item.category.toLowerCase() === 'lifestyle'
    );
  }, [allNews]);

  const filteredArticles = useMemo(() => {
    if (!lifestyleNews.length) return [];
    
    return lifestyleNews.filter(item => 
      item.subCategory?.toLowerCase() === activeTab.toLowerCase() ||
      item.tags?.some(tag => tag.toLowerCase() === activeTab.toLowerCase())
    ).slice(0, 8);
  }, [lifestyleNews, activeTab]);

  const lifestyleArticles: LifestyleArticle[] = useMemo(() => {
    return filteredArticles.map((item, index) => ({
      id: `${activeTab.toLowerCase()}-${item.slug}-${index}`,
      category: item.category || 'Lifestyle',
      title: item.title,
      image: item.image ? `/public/${item.image}` : 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=500&q=80',
    }));
  }, [filteredArticles, activeTab]);

  if (loading) {
    return (
      <section className={styles.lifestyleSection}>
        <div className={styles.container}>
          <div className={`${styles.articleGrid} animate-pulse`}>
            {Array(4).fill(0).map((_, i) => (
              <article key={i} className={styles.articleCard}>
                <div className="bg-gradient-to-br from-green-200 to-blue-200 h-48 rounded-lg"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.lifestyleSection}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>Lifestyle</h2>
        
        <nav className={styles.categoryNav}>
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`${styles.navBtn} ${activeTab === cat ? styles.active : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className={styles.contentGrid}>
          <div className={styles.articleGrid}>
            {lifestyleArticles.map((article) => (
              <article key={article.id} className={styles.articleCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className={styles.cardImage}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=500&q=80';
                    }}
                  />
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.categoryLabel}>{article.category}</span>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                </div>
              </article>
            ))}
          </div>

          <aside className={styles.adSidebar}>
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            <div className={styles.adFrame}>
              <div className={styles.adPlaceholder}>
                <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
                  <rect width="280" height="220" rx="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 193, 7, 0.3)" strokeWidth="2"/>
                  <text x="140" y="110" textAnchor="middle" fill="#ffc107" fontSize="16" fontWeight="600">Event Sponsor</text>
                  <text x="140" y="135" textAnchor="middle" fill="#ffc107" fontSize="12">300x250</text>
                </svg>
              </div>
            </div>
          </aside>
        </div>

        <div className={styles.footerAction}>
          <button className={styles.readMoreBtn}>Read More <span>→</span></button>
        </div>
      </div>
    </section>
  );
};

export default LifestyleSection;
