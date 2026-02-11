'use client';
import React, { useState, useMemo } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './SportsNews.module.scss';

interface RawSportsItem {
  slug: string;
  title: string;
  image?: string;
  category: string;
  tags?: string[];
  subCategory?: string;
}

interface SportsArticle {
  id: string;
  title: string;
  image: string;
  isFeatured: boolean;
}

const Sports: React.FC = () => {
  const { sportsNews, loading } = useNewsContext();
  
  const availableCategories = useMemo(() => {
    if (!sportsNews || sportsNews.length === 0) return [];

    const categoryCount: Record<string, number> = {};

    sportsNews.forEach(item => {
      const subCat = item.subCategory;
      if (subCat) {
        categoryCount[subCat] = (categoryCount[subCat] || 0) + 1;
      }
    });

    const categories = Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return categories.map(c => c.name);
  }, [sportsNews]);

  const [activeCategory, setActiveCategory] = useState(() => 
    availableCategories.length > 0 ? availableCategories[0] : 'Cricket'
  );

  useMemo(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories, activeCategory]);

  const getImageSrc = (img?: string): string => {
    if (!img) {
      return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80';
    }
    if (img.startsWith('http') || img.startsWith('data:')) {
      return img;
    }
    if (img.startsWith('/')) {
      return img;
    }
    return `/uploads/${img}`;
  };

  const filteredSportsNews = useMemo(() => {
    if (!sportsNews) return [];
    
    return sportsNews.filter(item => 
      item.subCategory?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [sportsNews, activeCategory]);

  const sportsArticles: SportsArticle[] = useMemo(() => {
    if (!filteredSportsNews.length) return [];
    
    return filteredSportsNews.slice(0, 6).map((item, index) => ({
      id: `${activeCategory.toLowerCase()}-${item.slug}-${index}`,
      title: item.title,
      image: getImageSrc(item.image),
      isFeatured: index === 0,
    }));
  }, [filteredSportsNews, activeCategory]);

  if (loading) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Sports</h2>
            <div className={styles.categoryNav}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className={styles.articlesContainer}>
            <div className={styles.articlesGrid}>
              <article className={`${styles.featuredArticle} animate-pulse`}>
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 rounded-2xl"></div>
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

  if (!sportsNews || sportsNews.length === 0) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Sports</h2>
          </div>
          <div className={styles.articlesContainer}>
            <p className="text-center text-gray-500 py-8">No sports news available</p>
          </div>
        </div>
      </section>
    );
  }

  if (availableCategories.length === 0) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Sports</h2>
          </div>
          <div className={styles.articlesContainer}>
            <p className="text-center text-gray-500 py-8">No sports categories available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.sportsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sports</h2>
          <nav className={styles.categoryNav}>
            {availableCategories.map((category) => (
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
          {sportsArticles.length > 0 ? (
            <div className={styles.articlesGrid}>
              {sportsArticles[0] && (
                <article className={styles.featuredArticle}>
                  <div className={styles.featuredImage}>
                    <img src={sportsArticles[0].image} alt={sportsArticles[0].title} />
                    <div className={styles.imageOverlay}></div>
                  </div>
                  <div className={styles.featuredContent}>
                    <span className={styles.categoryBadge}>{activeCategory}</span>
                    <h3 className={styles.featuredTitle}>{sportsArticles[0].title}</h3>
                  </div>
                </article>
              )}

              <div className={styles.regularArticles}>
                {sportsArticles.slice(1).map((article) => (
                  <article key={article.id} className={styles.regularArticle}>
                    <div className={styles.articleContent}>
                      <span className={styles.categoryBadge}>{activeCategory}</span>
                      <h4 className={styles.articleTitle}>{article.title}</h4>
                    </div>
                    <div className={styles.articleImage}>
                      <img src={article.image} alt={article.title} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No articles found for {activeCategory}</p>
            </div>
          )}
        </div>

        {sportsArticles.length > 0 && (
          <div className={styles.readMoreWrapper}>
            <button className={styles.readMoreButton}>
              Read More
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sports;
