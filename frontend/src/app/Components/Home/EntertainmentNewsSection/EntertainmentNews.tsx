"use client";
import React, { useState, useMemo } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './EntertainmentNews.module.scss';

interface RawEntItem {
  slug: string;
  title: string;
  image?: string;
  category: string;
  tags?: string[];
  subCategory?: string;
}

interface EntArticle {
  id: string;
  title: string;
  image: string;
  category: string;
}

const categories = ['Bollywood', 'TV', 'OTT', 'Reviews', 'Regional', 'Hollywood', 'Korean', 'Photos', 'Web Stories', 'Videos'];

const Entertainment: React.FC = () => {
  const { allNews, loading } = useNewsContext();
  const [activeCategory, setActiveCategory] = useState('Bollywood');

  const filteredEntNews = useMemo(() => {
    if (!allNews) return [];
    
    return allNews.filter(item => 
      item.category.toLowerCase() === 'entertainment' &&
      (
        item.subCategory?.toLowerCase() === activeCategory.toLowerCase() ||
        item.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase()) ||
        activeCategory === 'Bollywood'  
      )
    );
  }, [allNews, activeCategory]);

  const entertainmentArticles: EntArticle[] = useMemo(() => {
    if (!filteredEntNews.length) return [];
    
    return filteredEntNews.slice(0, 6).map((item, index) => ({
      id: `${activeCategory.toLowerCase()}-${item.slug}-${index}`,
      title: item.title,
      image: item.image ? `/public/${item.image}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
      category: activeCategory,
    }));
  }, [filteredEntNews, activeCategory]);

  if (loading) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.articlesContainer}>
            <div className={styles.articlesGrid}>
              <article className={`${styles.featuredArticle} animate-pulse`}>
                <div className="bg-gradient-to-br from-purple-200 to-pink-200 h-64 rounded-2xl"></div>
              </article>
              <div className={styles.regularArticles}>
                {Array(5).fill(0).map((_, i) => (
                  <article key={i} className={`${styles.regularArticle} animate-pulse`}>
                    <div className="space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-full"></div>
                    </div>
                    <div className="bg-gray-200 h-24 rounded"></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sportsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Entertainment</h2>
          <nav className={styles.categoryNav}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${
                  activeCategory === category ? styles.active : ''
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        <div className={styles.articlesContainer}>
          <div className={styles.articlesGrid}>
            {/* Featured Article */}
            {entertainmentArticles[0] && (
              <article className={styles.featuredArticle}>
                <div className={styles.featuredImage}>
                  <img src={entertainmentArticles[0].image} alt={entertainmentArticles[0].title} />
                  <div className={styles.imageOverlay}></div>
                </div>
                <div className={styles.featuredContent}>
                  <span className={styles.categoryBadge}>{entertainmentArticles[0].category}</span>
                  <h3 className={styles.featuredTitle}>{entertainmentArticles[0].title}</h3>
                </div>
              </article>
            )}

            {/* Regular Articles List */}
            <div className={styles.regularArticles}>
              {entertainmentArticles.slice(1).map((article) => (
                <article key={article.id} className={styles.regularArticle}>
                  <div className={styles.articleContent}>
                    <span className={styles.categoryBadge}>{article.category}</span>
                    <h4 className={styles.articleTitle}>{article.title}</h4>
                  </div>
                  <div className={styles.articleImage}>
                    <img src={article.image} alt={article.title} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.readMoreWrapper}>
          <button className={styles.readMoreButton}>
            More Entertainment News
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Entertainment;
