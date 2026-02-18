import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './NewsCard.module.scss';

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
    const itemCategorySlug = itemCategory.toLowerCase().replace(/\s+/g, '-');

    const expectedPath = `/Pages/${itemSection}/${itemCategorySlug}`;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

    if (normalizedPathname === expectedPath) {
      return `${expectedPath}/${item.slug}`;
    }

    return `/Pages/${itemSection}/${itemCategorySlug}/${item.slug}`;
  };

  const getCategoryLink = (categoryName: string): string => {
    const categorySection = getSectionFromCategory(categoryName);
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
    return `/Pages/${categorySection}/${categorySlug}`;
  };

  if (displayData.length === 0) {
    return (
      <div className={styles.categoryCardsWrapper}>
        <div className={`${styles.categoryCardsGrid} ${styles[`cols${columns}`]}`}>
          {Array(columns).fill(0).map((_, i) => (
            <div key={i} className={styles.categoryCard} style={{ opacity: 0.5 }}>
              <div className={styles.categoryHeader}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              </div>
              <div className={styles.featuredSection}>
                <div className={styles.imageContainer} style={{ background: '#e5e7eb' }}>
                  <div className="animate-pulse bg-gray-300 h-full w-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-full mt-4"></div>
              </div>
              <div className={styles.headlinesSection}>
                <div className="space-y-2 mt-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryCardsWrapper}>
      <div className={`${styles.categoryCardsGrid} ${styles[`cols${columns}`]}`}>
        {displayData.map((categorySection, index) => {
          const featuredItem = categorySection.items[0];
          const headlineItems = categorySection.items.slice(1, maxHeadlines + 1);

          if (!featuredItem) return null;

          return (
            <div
              key={categorySection.categoryName}
              className={styles.categoryCard}
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
                      const subcatSlug = subcat.toLowerCase().replace(/\s+/g, '-');

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
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const fLink = getItemLink(featuredItem, categorySection.categoryName);
                    if (fLink) router.push(fLink);
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
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            (e.currentTarget as any).src = '/images/placeholder-news.jpg';
                          }}
                        />

                        <div className={styles.imageOverlay}></div>

                        {featuredItem.isLive && (
                          <span className={styles.liveBadge}>
                            <span className={styles.liveIcon}>●</span> LIVE
                          </span>
                        )}

                        {featuredItem.isVideo && (
                          <span className={styles.mediaBadge}>
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        )}

                        {featuredItem.isPhoto && (
                          <span className={styles.mediaBadge}>
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
                    {featuredItem.date || 'Just now'}
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
                        key={item.id}
                        className={styles.headlineItem}
                        style={{
                          cursor: 'pointer',
                          ...(animationEnabled ? { animationDelay: `${(index * 0.1) + (idx * 0.05)}s` } : {})
                        }}
                        onClick={() => {
                          const hLink = getItemLink(item, categorySection.categoryName);
                          if (hLink) router.push(hLink);
                        }}
                      >
                        <span className={styles.headlineBorder}></span>
                        <div className={styles.headlineContent}>
                          <p className={styles.headlineText}>{item.title}</p>
                          {item.date && (
                            <span className={styles.headlineDate}>{item.date}</span>
                          )}
                        </div>
                        {(categorySection.categoryName === "AWARDS" || section === "awards") && (
                          <div className={styles.headlineAwardActions}>
                            {item.targetLink && (
                              <a
                                href={item.targetLink.startsWith('http') ? item.targetLink : `https://${item.targetLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.headlineMoreInfoBtn}
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
                                className={styles.headlineNominationBtn}
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
