'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './NewsSection.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';
import { useState, useEffect,useMemo } from 'react';

export interface NewsGridItem {
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
  subCategory: string;
  displaySubCategory?: string;
  isTrending?: boolean;
}

export interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
  subCategory?: string;
  displaySubCategory?: string;
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

const cleanDisplayText = (text: string): string => {
  return decodeURIComponent(text)
    .replace(/%26/g, '&')
    .replace(/%20/g, ' ')
    .replace(/%2B/g, '+')
    .trim();
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

  const mainNews: NewsGridItem[] = useMemo(() => {
    if (providedMainNews) return providedMainNews;
    return sectionNews.slice(0, 12).map((item, index) => ({
      id: `${section}-${item.slug || 'no-slug'}-${index}`,
      image: getImageSrc(item.image),
      title: item.title,
      slug: item.slug,
      category: item.category,
      subCategory: item.subCategory || '',
      displaySubCategory: cleanDisplayText(item.subCategory || ''),
      isTrending: item.isTrending
    }));
  }, [providedMainNews, sectionNews, section]);
  
  const topNews: TopNewsItem[] = useMemo(() => {
    if (providedTopNews) return providedTopNews;
    const trendingNews = sectionNews.filter(item => item.isTrending === true);
    const newsToShow = trendingNews.length >= 5 ? trendingNews : sectionNews;
    return newsToShow.slice(0, 5).map((item, index) => ({
      id: `${section}-top-${index}`,
      title: item.title,
      image: getImageSrc(item.image),
      slug: item.slug,
      subCategory: item.subCategory,
      displaySubCategory: cleanDisplayText(item.subCategory || '')
    }));
  }, [providedTopNews, sectionNews, section]);

  const { data: ads, loading: adsLoading } = useActiveAds();
  const activeAds = (ads || []).filter(ad => ad.isActive);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

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

  const hasTrendingNews = sectionNews.some(item => item.isTrending === true);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{sectionTitle}</h2>
          {subCategories.length > 0 && (
            <nav className={styles.subCategoryNav}>
              {subCategories.map((cat) => {
                const cleanCat = cleanDisplayText(cat);
                const categorySlug = encodeURIComponent(
                  cleanCat.toLowerCase().replace(/\s+/g, '-')
                );
                return (
                  <Link
                    key={cat}
                    href={`/Pages/${section}/${categorySlug}`}
                    className={styles.subCategoryLink}
                  >
                    {cleanCat}
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
              <div className="mb-6">
                {adsLoading ? (
                  <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center text-sm text-gray-600 min-h-[250px] flex items-center justify-center">
                    Loading advertisement...
                  </div>
                ) : activeAds.length > 0 ? (
                  <div className="relative rounded-lg overflow-hidden shadow-sm min-h-[250px]">
                    {activeAds.map((ad, index) => (
                      <a
                        key={ad._id}
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block absolute inset-0 transition-opacity duration-800 ease-in-out ${index === currentAdIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      >
                        <img
                          src={ad.imageUrl}
                          alt={ad.title || 'Advertisement'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {ad.title && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-medium p-3 text-center">
                            {ad.title}
                          </div>
                        )}
                      </a>
                    ))}
                    {activeAds.length > 1 && (
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                        {activeAds.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentAdIndex(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentAdIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            aria-label={`Go to ad ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 border border-gray-300 rounded p-4 text-center text-sm text-gray-600 min-h-[250px] flex items-center justify-center">
                    Advertisement space
                  </div>
                )}
              </div>
              <h3 className={styles.topNewsTitle}>
                {hasTrendingNews ? 'Trending News' : 'Top News'}
              </h3>
              <div className={styles.topNewsList}>
                {topNews.map((news) => (
                  <Link
                    key={news.id}
                    href={news.slug ? `/Pages/${section}/${encodeURIComponent(news.subCategory || '')}/${encodeURIComponent(news.slug || '')}` : '#'}
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

const NewsCard: React.FC<NewsCardProps> = ({ image, title, slug, category, currentSection, subCategory, displaySubCategory, isTrending }) => {
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
          {isTrending && (
            <span className={styles.trendingBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              Trending
            </span>
          )}
        </div>
        <p className={styles.newsTitle}>{title}</p>
      </div>
    );
  }

  const href = `/Pages/${section}/${encodeURIComponent(subCategory)}/${encodeURIComponent(slug)}`;

  return (
    <Link href={href} className={styles.newsCard}>
      <div className={styles.imageWrapper}>
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
        />
        {category && <span className={styles.categoryBadge}>{category}</span>}
        {isTrending && (
          <span className={styles.trendingBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            Trending
          </span>
        )}
      </div>
      <p className={styles.newsTitle}>{title}</p>
    </Link>
  );
};

export default NewsSection;