'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  slug: string;
  category: string;
  title: string;
  image: string;
}

interface ArticleCardProps {
  article: LifestyleArticle;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onClick: () => void;
}

interface CategoryNavProps {
  categories: string[];
  activeTab: string;
  onTabChange: (category: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=500&q=80';
const MAX_ARTICLES_PER_CATEGORY = 8;
const SKELETON_ITEMS = 4;
const CATEGORY_NAV_SKELETON_ITEMS = 6;

const getImageSrc = (img?: string): string => {
  if (!img) return FALLBACK_IMAGE;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return img;
  return `/uploads/${img}`;
};

const ArticleCard: React.FC<ArticleCardProps> = React.memo(({ article, onImageError, onClick }) => (
  <article className={styles.articleCard} onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className={styles.imageWrapper}>
      <img 
        src={article.image} 
        alt={article.title} 
        className={styles.cardImage}
        loading="lazy"
        onError={onImageError}
      />
    </div>
    <div className={styles.cardContent}>
      <span className={styles.categoryLabel}>{article.category}</span>
      <h3 className={styles.articleTitle}>{article.title}</h3>
    </div>
  </article>
));

ArticleCard.displayName = 'ArticleCard';

const CategoryNav: React.FC<CategoryNavProps> = React.memo(({ categories, activeTab, onTabChange }) => (
  <nav className={styles.categoryNav} role="tablist" aria-label="Lifestyle categories">
    {categories.map((category) => (
      <button 
        key={category} 
        className={`${styles.navBtn} ${activeTab === category ? styles.active : ''}`}
        onClick={() => onTabChange(category)}
        role="tab"
        aria-selected={activeTab === category}
        aria-controls={`${category}-panel`}
      >
        {category}
      </button>
    ))}
  </nav>
));

CategoryNav.displayName = 'CategoryNav';

const AdSidebar: React.FC = React.memo(() => (
  <aside className={styles.adSidebar} aria-label="Advertisement">
    <span className={styles.adLabel}>ADVERTISEMENT</span>
    <div className={styles.adFrame}>
      <div className={styles.adPlaceholder}>
        <svg width="280" height="220" viewBox="0 0 280 220" fill="none" aria-hidden="true">
          <rect width="280" height="220" rx="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 193, 7, 0.3)" strokeWidth="2"/>
          <text x="140" y="110" textAnchor="middle" fill="#ffc107" fontSize="16" fontWeight="600">Event Sponsor</text>
          <text x="140" y="135" textAnchor="middle" fill="#ffc107" fontSize="12">300x250</text>
        </svg>
      </div>
    </div>
  </aside>
));

AdSidebar.displayName = 'AdSidebar';

const LoadingSkeleton: React.FC = () => (
  <div className={styles.container}>
    <h2 className={styles.mainTitle}>Lifestyle</h2>
    <div className={styles.categoryNav}>
      {Array(CATEGORY_NAV_SKELETON_ITEMS).fill(0).map((_, i) => (
        <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
      ))}
    </div>
    <div className={`${styles.articleGrid} animate-pulse`}>
      {Array(SKELETON_ITEMS).fill(0).map((_, i) => (
        <article key={i} className={styles.articleCard}>
          <div className="bg-gradient-to-br from-green-200 to-blue-200 h-48 rounded-lg" />
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-full" />
          </div>
        </article>
      ))}
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-gray-500">{message}</p>
  </div>
);

const LifestyleSection: React.FC = () => {
  const router = useRouter();
  const { lifestyleNews, loading } = useNewsContext();
  
  const availableCategories = useMemo(() => {
    if (!lifestyleNews?.length) return [];

    const categoryCount = lifestyleNews.reduce((acc, item) => {
      const subCat = item.subCategory;
      if (subCat) acc[subCat] = (acc[subCat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name]) => name);
  }, [lifestyleNews]);

  const [activeTab, setActiveTab] = useState<string>(() => 
    availableCategories[0] || 'Food'
  );

  useMemo(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeTab)) {
      setActiveTab(availableCategories[0]);
    }
  }, [availableCategories, activeTab]);

  const filteredArticles = useMemo(() => {
    if (!lifestyleNews) return [];
    
    return lifestyleNews
      .filter(item => item.subCategory?.toLowerCase() === activeTab.toLowerCase())
      .slice(0, MAX_ARTICLES_PER_CATEGORY);
  }, [lifestyleNews, activeTab]);

  const lifestyleArticles: LifestyleArticle[] = useMemo(() => 
    filteredArticles.map((item, index) => ({
      id: `${activeTab.toLowerCase()}-${item.slug}-${index}`,
      slug: item.slug,
      category: item.subCategory || item.category || 'Lifestyle',
      title: item.title,
      image: getImageSrc(item.image),
    })),
    [filteredArticles, activeTab]
  );

  const handleTabChange = useCallback((category: string) => {
    setActiveTab(category);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  }, []);

  const handleArticleClick = useCallback((slug: string, category: string) => {
    router.push(`/Pages/lifestyle/${category}/${slug}`);
  }, [router]);

  const handleReadMoreClick = useCallback(() => {
    router.push('/Pages/lifestyle');
  }, [router]);

  if (loading) {
    return (
      <section className={styles.lifestyleSection}>
        <LoadingSkeleton />
      </section>
    );
  }

  if (!lifestyleNews?.length) {
    return (
      <section className={styles.lifestyleSection}>
        <div className={styles.container}>
          <h2 className={styles.mainTitle}>Lifestyle</h2>
          <EmptyState message="No lifestyle news available" />
        </div>
      </section>
    );
  }

  if (!availableCategories.length) {
    return (
      <section className={styles.lifestyleSection}>
        <div className={styles.container}>
          <h2 className={styles.mainTitle}>Lifestyle</h2>
          <EmptyState message="No lifestyle categories available" />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.lifestyleSection}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>Lifestyle</h2>
        
        <CategoryNav 
          categories={availableCategories}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <div className={styles.contentGrid}>
          {lifestyleArticles.length > 0 ? (
            <div 
              className={`${styles.articleGrid} ${lifestyleArticles.length === 1 ? styles.singleCard : ''}`}
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={activeTab}
            >
              {lifestyleArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article}
                  onImageError={handleImageError}
                  onClick={() => handleArticleClick(article.slug, article.category)}
                />
              ))}
            </div>
          ) : (
            <EmptyState message={`No articles found for ${activeTab}`} />
          )}

          <AdSidebar />
        </div>

        {lifestyleArticles.length > 0 && (
          <div className={styles.footerAction}>
            <button 
              className={styles.readMoreBtn} 
              aria-label="Read more lifestyle articles"
              onClick={handleReadMoreClick}
            >
              Read More <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LifestyleSection;
