'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { useActiveAds } from '@/app/hooks/useAds'; 
import { formatDateTime } from '@/Utils/Utils';
import styles from './LifestyleSection.module.scss';

interface RawLifestyleItem {
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

interface LifestyleArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  image: string;
  date?: string;
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
      {article.date && (
        <div className={styles.articleMeta}>
          <span className={styles.timestamp}>
            {formatDateTime(article.date)}
          </span>
        </div>
      )}
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
  
  const { data: adsData, loading: adsLoading } = useActiveAds();
  const activeAds = (adsData || []).filter(ad => ad.isActive);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % activeAds.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeAds.length]);

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

  useEffect(() => {
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
      date: item.publishedAt || item.date || item.createdAt,
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

  const renderAd = () => {
    if (adsLoading) {
      return (
        <div className={styles.adPlaceholder}>
          <span>Loading advertisement...</span>
        </div>
      );
    }

    if (activeAds.length === 0) {
      return (
        <div className={styles.adPlaceholder}>
          <div className={styles.emptyAdBox}>
            <span>AD SPACE</span>
            <small>Will adjust to image size</small>
          </div>
        </div>
      );
    }

    const ad = activeAds[currentAdIndex % activeAds.length];

    return (
      <div className={styles.adWrapper}>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adLink}
        >
          <img
            src={ad.imageUrl}
            alt={ad.title || 'Advertisement'}
            className={styles.adImage}
            loading="lazy"
          />
        </a>

        {activeAds.length > 1 && (
          <div className={styles.adDots}>
            {activeAds.map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i === currentAdIndex % activeAds.length ? styles.activeDot : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

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

          <aside className={styles.adSidebar} aria-label="Advertisement">
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            {renderAd()}
          </aside>
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