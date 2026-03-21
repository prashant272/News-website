import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import { formatDateTime } from '@/Utils/Utils';
import styles from './NewsCard.module.scss';
import { NewsItem as SharedNewsItem } from '@/app/services/NewsService';

// --- SINGULAR NEWS CARD COMPONENT (Used in Search, NewsSection, etc.) ---

export interface NewsCardProps {
  id?: string | number;
  image?: string;
  title?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  displaySubCategory?: string;
  isTrending?: boolean;
  date?: string;
  targetLink?: string;
  nominationLink?: string;
  currentSection?: string;
  item?: SharedNewsItem; // Option 1: Support passing the whole item
}

export const NewsCard: React.FC<NewsCardProps> = (props) => {
  const pathname = usePathname();
  const router = useRouter();

  // Extract data from either individual props or the 'item' prop
  const { item } = props;

  const title = item?.title || props.title || '';
  const image = item?.image || props.image || '';
  const slug = item?.slug || props.slug;
  const category = item?.category || props.category;
  const subCategory = item?.subCategory || props.subCategory || '';
  const isTrending = item?.isTrending || props.isTrending;
  const date = item?.date || props.date;
  const targetLink = item?.targetLink || props.targetLink;
  const nominationLink = item?.nominationLink || props.nominationLink;

  // currentSection logic (simplified from your NewsSection version)
  const getSectionFromUrl = (path: string): string => {
    const parts = path.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');
    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      return parts[pagesIndex + 1];
    }
    return 'india';
  };

  const section = props.currentSection || getSectionFromUrl(pathname);
  const displayImage = getImageSrc(image);

  const cleanSubCategory = (text: string): string => {
    return decodeURIComponent(text)
      .replace(/%26/g, '&')
      .replace(/%20/g, ' ')
      .replace(/%2B/g, '+')
      .trim();
  };

  const displaySubCategory = props.displaySubCategory || (subCategory ? cleanSubCategory(subCategory) : '');

  const href = slug ? `/Pages/${section}/${encodeURIComponent(subCategory || 'general')}/${encodeURIComponent(slug)}` : undefined;

  const handleCardClick = () => {
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const cardContent = (
    <>
      <div className={styles.imageWrapper}>
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
        />
        <div className={styles.imageOverlay}></div>
        {category && <span className={styles.categoryBadge}>{category}</span>}
        {isTrending && (
          <span className={styles.trendingBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
            </svg>
            Trending
          </span>
        )}
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardMeta}>
          {displaySubCategory && <span className={styles.subCategoryName}>{displaySubCategory}</span>}
          {date && <span className={styles.newsDate}>{formatDateTime(date)}</span>}
        </div>
        <p className={styles.newsTitle}>{title}</p>

        {(section?.toLowerCase() === "awards" || category?.toUpperCase() === "AWARDS") && (
          <div className={styles.awardActions}>
            {targetLink && (
              <a
                href={targetLink.startsWith('http') ? targetLink : `https://${targetLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.moreInfoBtn}
                onClick={(e) => e.stopPropagation()}
              >
                More Info
              </a>
            )}
            {nominationLink && (
              <a
                href={nominationLink.startsWith('http') ? nominationLink : `https://${nominationLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.nominationBtn}
                onClick={(e) => e.stopPropagation()}
              >
                Nomination
              </a>
            )}
          </div>
        )}

        <div className={styles.readMore}>
          <span>Read More</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </>
  );

  if (!href) {
    return <div className={styles.newsCard}>{cardContent}</div>;
  }

  return (
    <div
      onClick={handleCardClick}
      className={styles.newsCard}
      style={{ cursor: 'pointer' }}
    >
      {cardContent}
    </div>
  );
};

// --- PLURAL NEWS CARDS COMPONENT (For category sections) ---

export interface NewsItem {
  id: string | number;
  title: string;
  image?: string;
  category?: string;
  isLive?: boolean;
  isVideo?: boolean;
  isPhoto?: boolean;
  slug?: string;
  date?: string;
  relatedLinks?: string[];
  targetLink?: string;
  nominationLink?: string;
}

export interface CategorySection {
  categoryName: any;
  items: NewsItem[];
  subcategories?: string[];
}

interface NewsCardsProps {
  data?: CategorySection[];
  columns?: 2 | 3 | 4;
  showSubcategories?: boolean;
  animationEnabled?: boolean;
  showViewMore?: boolean;
  maxHeadlines?: number;
  overrideSection?: 'india' | 'sports' | 'business' | 'entertainment' | 'lifestyle' | 'all';
}

const NewsCards: React.FC<NewsCardsProps> = ({
  data,
  columns = 3,
  showSubcategories = false,
  animationEnabled = true,
  showViewMore = true,
  maxHeadlines = 4,
  overrideSection
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const section = useMemo(() => {
    if (overrideSection) return overrideSection;

    const parts = pathname.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');

    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      const candidate = parts[pagesIndex + 1];
      if (['india', 'sports', 'business', 'entertainment', 'lifestyle'].includes(candidate)) {
        return candidate;
      }
    }

    return 'india';
  }, [pathname, overrideSection]);

  const sectionData = useMemo(() => {
    switch (section) {
      case 'india': return indiaNews || [];
      case 'sports': return sportsNews || [];
      case 'business': return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle': return lifestyleNews || [];
      default: return allNews || [];
    }
  }, [section, allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews]);

  const contextData: CategorySection[] = useMemo(() => {
    if (!sectionData || sectionData.length === 0) return [];

    const grouped: Record<string, NewsItem[]> = {};

    sectionData.forEach((item: any) => {
      const category = item.category || section.toUpperCase();
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: item._id || item.id || item.slug,
        title: item.title,
        image: item.image,
        category: item.category,
        slug: item.slug,
        date: item.date,
        isLive: item.isLive,
        isVideo: item.isVideo,
        isPhoto: item.isPhoto,
        targetLink: item.targetLink,
        nominationLink: item.nominationLink
      });
    });

    return Object.entries(grouped).map(([categoryName, items]) => ({
      categoryName,
      items: items.slice(0, maxHeadlines + 1),
      subcategories: []
    }));
  }, [sectionData, section, maxHeadlines]);

  const displayData = contextData;

  const CATEGORY_TO_SECTION_MAP: Record<string, string> = {
    'Cricket': 'sports',
    'Football': 'sports',
    'Tennis': 'sports',
    'Badminton': 'sports',
    'Hockey': 'sports',
    'Athletics': 'sports',
    'Wrestling': 'sports',
    'IPL': 'sports',
    'Olympics': 'sports',
    'Market': 'business',
    'Personal Finance': 'business',
    'Income Tax': 'business',
    'Travel': 'lifestyle',
    'Food': 'lifestyle',
    'Beauty': 'lifestyle',
    'Maharashtra': 'india',
    'Uttar Pradesh': 'india',
    'Odisha': 'india',
    'Bihar': 'india',
    'Madhya Pradesh': 'india',
    'Karnataka': 'india',
    'Tamil Nadu': 'india',
    'West Bengal': 'india',
    'USA': 'world',
    'Europe': 'world',
    'Asia Pacific': 'world',
    'Middle East': 'world',
  };

  const getSectionFromCategory = (categoryName: string): string => {
    return CATEGORY_TO_SECTION_MAP[categoryName] || section;
  };

  const getItemLink = (item: NewsItem, categoryName: string): string => {
    if (!item.slug) {
      return `/news/${item.id}`;
    }

    const itemCategory = item.category || categoryName;
    const itemSection = getSectionFromCategory(itemCategory);
    const itemCategorySlug = encodeURIComponent(itemCategory.toLowerCase().replace(/\s+/g, '-'));

    const expectedPath = `/Pages/${itemSection}/${itemCategorySlug}`;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    if (normalizedPathname === expectedPath) {
      return `${expectedPath}/${encodeURIComponent(item.slug || '')}`;
    }

    return `/Pages/${itemSection}/${itemCategorySlug}/${encodeURIComponent(item.slug || '')}`;
  };

  const getCategoryLink = (categoryName: string): string => {
    const categorySection = getSectionFromCategory(categoryName);
    const categorySlug = encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, '-'));
    return `/Pages/${categorySection}/${categorySlug}`;
  };

  const columnClass = useMemo(() => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-3';
    }
  }, [columns]);

  if (displayData.length === 0) {
    return (
      <div className="relative overflow-hidden bg-[var(--background)] px-8 py-12 transition-colors duration-300 md:px-6 sm:px-3 after:absolute after:left-1/2 after:top-0 after:h-full after:w-[1px] after:-translate-x-1/2 after:bg-gradient-to-b after:from-transparent after:via-[var(--border)] after:to-transparent after:pointer-events-none">
        <div className={`relative z-[1] mx-auto grid max-w-[1400px] gap-5 ${columnClass} lg:grid-cols-2 md:grid-cols-1`}>
          {Array(columns).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] opacity-50 shadow-sm p-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-4 animate-pulse"></div>
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryCardsWrapper}>
      <div className={`${styles.categoryCardsGrid} ${styles[columnClass]}`}>
        {displayData.map((categorySection, index) => {
          const featuredItem = categorySection.items[0];
          const headlineItems = categorySection.items.slice(1, maxHeadlines + 1);

          if (!featuredItem) return null;

          return (
            <div
              key={categorySection.categoryName}
              className={`${styles.categoryCard} ${animationEnabled ? styles.animated : styles.visible}`}
              style={animationEnabled ? { animationDelay: `${index * 0.1}s` } : undefined}
            >
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>
                  <span className={styles.categoryIcon}></span>
                  {categorySection.categoryName}
                </h2>

                {showSubcategories && categorySection.subcategories && categorySection.subcategories.length > 0 && (
                  <div className={styles.subcategoriesWrapper}>
                    {categorySection.subcategories.map((subcat, idx) => {
                      const subcatSection = getSectionFromCategory(categorySection.categoryName);
                      const subcatSlug = encodeURIComponent(subcat.toLowerCase().replace(/\s+/g, '-'));

                      return (
                        <Link
                          key={`${subcat}-${idx}`}
                          href={`/Pages/${subcatSection}/${subcatSlug}`}
                          className={styles.subcategoryPill}
                        >
                          {subcat}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.featuredSection}>
                <div
                  className={styles.featuredArticle}
                  onClick={() => {
                    const fLink = getItemLink(featuredItem, categorySection.categoryName);
                    if (fLink) window.open(fLink, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className={styles.imageContainer}>
                    {featuredItem.image ? (
                      <>
                        <Image
                          src={featuredItem.image}
                          alt={featuredItem.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={(e) => {
                            (e.currentTarget as any).src = '/images/placeholder-news.jpg';
                          }}
                        />

                        <div className={styles.imageOverlay}></div>

                        {featuredItem.isLive && (
                          <span className={styles.liveBadge}>
                            <span className={styles.liveIcon}></span> LIVE
                          </span>
                        )}

                        {featuredItem.isVideo && (
                          <span className={`${styles.mediaBadge} ${styles.videoIcon}`}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        )}

                        {featuredItem.isPhoto && (
                          <span className={`${styles.mediaBadge} ${styles.photoIcon}`}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                          </span>
                        )}
                      </>
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h3 className={styles.featuredTitle}>{featuredItem.title}</h3>

                  <span className={styles.featuredDate}>
                    {featuredItem.date ? formatDateTime(featuredItem.date) : 'Just now'}
                  </span>
                </div>

                {(categorySection.categoryName === "AWARDS" || section === "awards") && (
                  <div className={styles.awardActions}>
                    {featuredItem.targetLink && (
                      <a
                        href={featuredItem.targetLink.startsWith('http') ? featuredItem.targetLink : `https://${featuredItem.targetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.moreInfoBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        More Info
                      </a>
                    )}
                    {featuredItem.nominationLink && (
                      <a
                        href={featuredItem.nominationLink.startsWith('http') ? featuredItem.nominationLink : `https://${featuredItem.nominationLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.nominationBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Nomination
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.headlinesSection}>
                {headlineItems.length > 0 ? (
                  <div className={styles.headlinesList}>
                    {headlineItems.map((item, idx) => (
                      <div
                        key={`${categorySection.categoryName}-${idx}-${item.id}`}
                        className={styles.headlineItem}
                        style={animationEnabled ? { animationDelay: `${(index * 0.1) + ((idx + 1) * 0.05)}s` } : undefined}
                        onClick={() => {
                          const hLink = getItemLink(item, categorySection.categoryName);
                          if (hLink) window.open(hLink, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <span className={styles.headlineBorder}></span>
                        <div className={styles.headlineContent}>
                          <p className={styles.headlineText}>{item.title}</p>
                          {item.date && (
                            <span className={styles.headlineDate}>{formatDateTime(item.date)}</span>
                          )}
                        </div>

                        {(categorySection.categoryName === "AWARDS" || section === "awards") && (
                          <div className={styles.awardActionsSmall}>
                            {item.targetLink && (
                              <a
                                href={item.targetLink.startsWith('http') ? item.targetLink : `https://${item.targetLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.infoBtnSmall}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Info
                              </a>
                            )}
                            {item.nominationLink && (
                              <a
                                href={item.nominationLink.startsWith('http') ? item.nominationLink : `https://${item.nominationLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.nominationBtnSmall}
                                onClick={(e) => e.stopPropagation()}
                              >
                                Nominate
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noHeadlines}>
                    <p>No additional headlines</p>
                  </div>
                )}
              </div>

              {featuredItem.relatedLinks && featuredItem.relatedLinks.length > 0 && (
                <div className={styles.relatedLinksSection}>
                  <h4 className={styles.relatedLinksTitle}>Related Stories</h4>
                  <ul className={styles.relatedLinksList}>
                    {featuredItem.relatedLinks.slice(0, 3).map((link, idx) => (
                      <li key={idx} className={styles.relatedLinkItem}>
                        <span className={styles.relatedLinkBullet}>→</span>
                        <span className={styles.relatedLinkText}>{link}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showViewMore && (
                <div className={styles.cardFooter}>
                  <Link
                    href={getCategoryLink(categorySection.categoryName)}
                    className={styles.moreAboutButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>More About {categorySection.categoryName}</span>
                    <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div >
    </div >
  );
};

export default NewsCards;
