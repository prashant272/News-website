'use client';
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { formatDateTime } from '@/Utils/Utils';
import styles from './EntertainmentNews.module.scss';

interface RawEntItem {
  slug: string;
  title: string;
  image?: string;
  category: string;
  tags?: string[];
  subCategory?: string;
  publishedAt?: string;
  date?: string;
  createdAt?: string;
}

interface EntArticle {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  date?: string;
}

const Entertainment: React.FC = () => {
  const router = useRouter();
  const { entertainmentNews, loading } = useNewsContext();
  
  const availableCategories = useMemo(() => {
    if (!entertainmentNews || entertainmentNews.length === 0) return [];

    const categoryCount: Record<string, number> = {};

    entertainmentNews.forEach(item => {
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
  }, [entertainmentNews]);

  const [activeCategory, setActiveCategory] = useState(() => 
    availableCategories.length > 0 ? availableCategories[0] : 'Bollywood'
  );

  useMemo(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories, activeCategory]);

  const getImageSrc = (img?: string): string => {
    if (!img) {
      return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80';
    }
    if (img.startsWith('http') || img.startsWith('data:')) {
      return img;
    }
    if (img.startsWith('/')) {
      return img;
    }
    return `/uploads/${img}`;
  };

  const filteredEntNews = useMemo(() => {
    if (!entertainmentNews) return [];
    
    return entertainmentNews.filter(item => 
      item.subCategory?.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [entertainmentNews, activeCategory]);

  const entertainmentArticles: EntArticle[] = useMemo(() => {
    if (!filteredEntNews.length) return [];
    
    return filteredEntNews.slice(0, 6).map((item, index) => ({
      id: `${activeCategory.toLowerCase()}-${item.slug}-${index}`,
      slug: item.slug,
      title: item.title,
      image: getImageSrc(item.image),
      category: activeCategory,
      date: item.publishedAt || item.date || item.createdAt,
    }));
  }, [filteredEntNews, activeCategory]);

  const handleArticleClick = (slug: string, category: string) => {
    router.push(`/Pages/entertainment/${category}/${slug}`);
  };

  const handleReadMoreClick = () => {
    router.push('/Pages/entertainment');
  };

  if (loading) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Entertainment</h2>
            <div className={styles.categoryNav}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
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

  if (!entertainmentNews || entertainmentNews.length === 0) {
    return (
      <section className={styles.sportsSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Entertainment</h2>
          </div>
          <div className={styles.articlesContainer}>
            <p className="text-center text-gray-500 py-8">No entertainment news available</p>
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
            <h2 className={styles.title}>Entertainment</h2>
          </div>
          <div className={styles.articlesContainer}>
            <p className="text-center text-gray-500 py-8">No entertainment categories available</p>
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
          {entertainmentArticles.length > 0 ? (
            <div className={styles.articlesGrid}>
              {entertainmentArticles[0] && (
                <article 
                  className={styles.featuredArticle}
                  onClick={() => handleArticleClick(entertainmentArticles[0].slug, entertainmentArticles[0].category)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.featuredImage}>
                    <img src={entertainmentArticles[0].image} alt={entertainmentArticles[0].title} />
                    <div className={styles.imageOverlay}></div>
                  </div>
                  <div className={styles.featuredContent}>
                    <span className={styles.categoryBadge}>{entertainmentArticles[0].category}</span>
                    <h3 className={styles.featuredTitle}>{entertainmentArticles[0].title}</h3>
                    {entertainmentArticles[0].date && (
                      <div className={styles.articleMeta} style={{ color: 'rgba(255,255,255,0.8)' }}>
                        <span className={styles.timestamp}>
                          {formatDateTime(entertainmentArticles[0].date)}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              )}

              <div className={styles.regularArticles}>
                {entertainmentArticles.slice(1).map((article) => (
                  <article 
                    key={article.id} 
                    className={styles.regularArticle}
                    onClick={() => handleArticleClick(article.slug, article.category)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.articleContent}>
                      <span className={styles.categoryBadge}>{article.category}</span>
                      <h4 className={styles.articleTitle}>{article.title}</h4>
                      {article.date && (
                        <div className={styles.articleMeta}>
                          <span className={styles.timestamp}>
                            {formatDateTime(article.date)}
                          </span>
                        </div>
                      )}
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

        {entertainmentArticles.length > 0 && (
          <div className={styles.readMoreWrapper}>
            <button 
              className={styles.readMoreButton}
              onClick={handleReadMoreClick}
            >
              More Entertainment News
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

export default Entertainment;
