"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './NewsSection.module.scss';

export interface NewsGridItem {
  // sectionTitle: string;
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
}

export interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
}

interface NewsSectionProps {
  sectionTitle: string;
  subCategories?: string[];
  mainNews: NewsGridItem[];
  topNews?: TopNewsItem[];
  showSidebar?: boolean;
  gridColumns?: 2 | 3 | 4;
  currentSection?: string;
}

const CATEGORY_TO_SECTION_MAP: Record<string, string> = {
  // Sports
  'Cricket': 'sports', 'Football': 'sports', 'Tennis': 'sports',
  'Badminton': 'sports', 'Hockey': 'sports', 'Athletics': 'sports',
  
  // Business  
  'Markets': 'business', 'Economy': 'business', 'Banking': 'business',
  'Startups': 'business', 'Cryptocurrency': 'business',
  
  // Tech
  'AI': 'tech', 'Smartphones': 'tech', 'Gadgets': 'tech',
  
  // Entertainment
  'Bollywood': 'entertainment', 'Hollywood': 'entertainment',
  'TV': 'entertainment', 'OTT': 'entertainment',
  
  // Lifestyle
  'Food': 'lifestyle', 'Travel': 'lifestyle', 'Beauty': 'lifestyle',
  
  // Default mappings
  'Maharashtra': 'india', 'National': 'india', 'Politics': 'india',
};

const getSectionFromCategory = (categoryName: string): string => {
  return CATEGORY_TO_SECTION_MAP[categoryName] || 'news';
};

const NewsSection: React.FC<NewsSectionProps> = ({
  sectionTitle,
  subCategories = [],
  showSidebar = true,
  gridColumns = 3,
  currentSection
}) => {
  const pathname = usePathname();
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews } = useNewsContext();

  const getSectionFromUrl = (): string => {
    const parts = pathname.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');
    
    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      return parts[pagesIndex + 1];
    }
    
    return currentSection || 'sports';
  };

  const section = getSectionFromUrl();

  const sectionNews = (() => {
    switch (section) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      default: return allNews || [];
    }
  })();

  const mainNews: NewsGridItem[] = React.useMemo(() => {
    return sectionNews.slice(0, 12).map((item, index) => ({
      // sectionTitle: sectionTitle,
      id: `${section}-${item.slug}-${index}`,
      image: item.image || '',
      title: item.title,
      slug: item.slug,
      category: item.category || item.subCategory,
    }));
  }, [sectionNews, section]);

  const topNews: TopNewsItem[] = React.useMemo(() => {
    return sectionNews.slice(0, 5).map((item, index) => ({
      id: `${section}-top-${index}`,
      title: item.title,
      image: item.image || '',
      slug: item.slug,
    }));
  }, [sectionNews, section]);

  if (!sectionNews.length) {
    return (
      <div className={styles.pageWrapper}>
        <section className={styles.sectionContainer}>
          <div className={`${styles.mainGrid} ${styles[`cols${gridColumns}`]} animate-pulse`}>
            {Array(gridColumns * 4).fill(0).map((_, i) => (
              <div key={i} className={styles.newsCard}>
                <div className="bg-gray-200 h-48 rounded-lg"></div>
                <div className="mt-3 h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          {subCategories.length > 0 && (
            <nav className={styles.subCategoryNav}>
              {subCategories.map((cat) => {
                const categorySlug = cat.toLowerCase().replace(/\s+/g, '-');
                return (
                  <Link 
                    key={cat} 
                    href={`/Pages/${section}/${categorySlug}`}
                    className={styles.subCategoryLink}
                  >
                    {cat}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className={showSidebar ? styles.layoutWithSidebar : styles.layoutFullWidth}>
          <div className={`${styles.mainGrid} ${styles[`cols${gridColumns}`]}`}>
            {mainNews.map((news) => (
              <NewsCard 
                key={news.id} 
                currentSection={section}
                {...news} 
              />
            ))}
          </div>

          {showSidebar && topNews.length > 0 && (
            <aside className={styles.sidebar}>
              <div className={styles.adPlaceholder}>Advertisement</div>
              <h3 className={styles.topNewsTitle}>Top News</h3>
              <div className={styles.topNewsList}>
                {topNews.map((news) => (
                  <Link
                    key={news.id}
                    href={news.slug ? `/Pages/${section}/${news.slug}` : '#'}
                    className={styles.topNewsItem}
                  >
                    <p>{news.title}</p>
                    <img 
                      src={news.image ? `/public/${news.image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'}
                      alt={news.title} 
                      loading="lazy" 
                    />
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
};

interface NewsCardProps extends NewsGridItem {
  currentSection: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ image, title, slug, category, currentSection }) => {
  if (!slug) {
    return (
      <div className={styles.newsCard}>
        <div className={styles.imageWrapper}>
          <img 
            src={image ? `/public/${image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'}
            alt={title} 
            loading="lazy" 
          />
          {category && <span className={styles.categoryBadge}>{category}</span>}
        </div>
        <p className={styles.newsTitle}>{title}</p>
      </div>
    );
  }

  const itemSection = category ? getSectionFromCategory(category) : currentSection;
  const categorySlug = category?.toLowerCase().replace(/\s+/g, '-') || '';
  const href = `/Pages/${itemSection}/${categorySlug}/${slug}`;

  return (
    <Link href={href} className={styles.newsCard}>
      <div className={styles.imageWrapper}>
        <img 
          src={image ? `/public/${image}` : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'}
          alt={title} 
          loading="lazy" 
        />
        {category && <span className={styles.categoryBadge}>{category}</span>}
      </div>
      <p className={styles.newsTitle}>{title}</p>
    </Link>
  );
};

export default NewsSection;
