"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './NewsSection.module.scss';

export interface NewsGridItem {
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
  subCategory: string;
}

export interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
  subCategory?: string;
}

interface NewsSectionProps {
  sectionTitle: string;
  subCategories?: string[];
  mainNews?: NewsGridItem[];
  topNews?: TopNewsItem[];
  showSidebar?: boolean;
  gridColumns?: 2 | 3 | 4;
  currentSection?: string;
}

const CATEGORY_TO_SECTION_MAP: Record<string, string> = {
  'Cricket': 'sports', 'Football': 'sports', 'Tennis': 'sports',
  'Badminton': 'sports', 'Hockey': 'sports', 'Athletics': 'sports',
  'Markets': 'business', 'Economy': 'business', 'Banking': 'business',
  'Startups': 'business', 'Cryptocurrency': 'business',
  'AI': 'tech', 'Smartphones': 'tech', 'Gadgets': 'tech',
  'Bollywood': 'entertainment', 'Hollywood': 'entertainment',
  'TV': 'entertainment', 'OTT': 'entertainment',
  'Food': 'lifestyle', 'Travel': 'lifestyle', 'Beauty': 'lifestyle',
  'Maharashtra': 'india', 'National': 'india', 'Politics': 'india',
};

const getSectionFromUrl = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  const pagesIndex = parts.indexOf('Pages');
  if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
    return parts[pagesIndex + 1];
  }
  return 'india';
};

const getSection = (
  pathname: string,
  category?: string,
  fallback: string = 'india'
): string => {
  const fromUrl = getSectionFromUrl(pathname);
  if (['india', 'sports', 'business', 'entertainment', 'lifestyle', 'tech'].includes(fromUrl)) {
    return fromUrl;
  }
  if (category && CATEGORY_TO_SECTION_MAP[category]) {
    return CATEGORY_TO_SECTION_MAP[category];
  }
  return fallback;
};

const NewsSection: React.FC<NewsSectionProps> = ({
  sectionTitle,
  subCategories = [],
  mainNews: providedMainNews,
  topNews: providedTopNews,
  showSidebar = true,
  gridColumns = 3,
}) => {
  const pathname = usePathname();
  const section = getSectionFromUrl(pathname);
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const sectionNews = (() => {
    switch (section) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle': return lifestyleNews || [];
      default: return allNews || [];
    }
  })();

  const mainNews: NewsGridItem[] = React.useMemo(() => {
    if (providedMainNews) return providedMainNews;
    
    return sectionNews.slice(0, 12).map((item, index) => ({
      id: `${section}-${item.slug || 'no-slug'}-${index}`,
      image: getImageSrc(item.image),
      title: item.title,
      slug: item.slug,
      category: item.category,
      subCategory: item.subCategory || ''
    }));
  }, [providedMainNews, sectionNews, section]);

  const topNews: TopNewsItem[] = React.useMemo(() => {
    if (providedTopNews) return providedTopNews;
    
    return sectionNews.slice(0, 5).map((item, index) => ({
      id: `${section}-top-${index}`,
      title: item.title,
      image: getImageSrc(item.image),
      slug: item.slug,
      subCategory: item.subCategory
    }));
  }, [providedTopNews, sectionNews, section]);

  if (!sectionNews.length && !providedMainNews) {
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
                const categorySlug = cat.toLowerCase().replace(/\\s+/g, '-');
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
                    href={news.slug ? `/Pages/${section}/${news.subCategory}/${news.slug}` : '#'}
                    className={styles.topNewsItem}
                  >
                    <p>{news.title}</p>
                    <img
                      src={news.image}
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

const NewsCard: React.FC<NewsCardProps> = ({ image, title, slug, category, currentSection, subCategory }) => {
  const pathname = usePathname();
  const section = getSection(pathname, category, currentSection);

  const displayImage = getImageSrc(image);

  if (!slug) {
    return (
      <div className={styles.newsCard}>
        <div className={styles.imageWrapper}>
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
          />
          {category && <span className={styles.categoryBadge}>{category}</span>}
        </div>
        <p className={styles.newsTitle}>{title}</p>
      </div>
    );
  }

  const href = `/Pages/${section}/${subCategory}/${slug}`;

  return (
    <Link href={href} className={styles.newsCard}>
      <div className={styles.imageWrapper}>
        <img
          src={displayImage}
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
