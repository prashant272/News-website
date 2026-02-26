import React, { useMemo } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';

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
  subCategory?: string;
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

// --- Singular NewsCard Component ---

interface SingleNewsCardProps {
  item?: any;
  currentSection?: string;
  // Fallback direct props if item is not provided
  image?: string;
  title?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  isTrending?: boolean;
  targetLink?: string;
  nominationLink?: string;
  date?: string;
  isVideo?: boolean;
}

export const NewsCard: React.FC<SingleNewsCardProps> = ({
  item,
  currentSection,
  image,
  title,
  slug,
  category,
  subCategory,
  isTrending,
  targetLink,
  nominationLink,
  date,
  isVideo
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Extract properties from item or fallback to direct props
  const displayTitle = item?.title || title || 'Untitled';
  const displayImage = getImageSrc(item?.image || image);
  const displaySlug = item?.slug || slug;
  const displayCategory = item?.category || category;
  const displaySubCategory = item?.subCategory || subCategory || 'general';
  const displayDate = item?.publishedAt || item?.date || date;
  const displayIsTrending = item?.isTrending || isTrending;
  const displayIsVideo = item?.isVideo || isVideo || item?.tags?.includes('video');
  const displayTargetLink = item?.targetLink || targetLink;
  const displayNominationLink = item?.nominationLink || nominationLink;

  const section = useMemo(() => {
    if (currentSection) return currentSection;
    if (displayCategory && CATEGORY_TO_SECTION_MAP[displayCategory]) return CATEGORY_TO_SECTION_MAP[displayCategory];

    const parts = pathname.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');
    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      return parts[pagesIndex + 1];
    }
    return 'india';
  }, [pathname, currentSection, displayCategory]);

  const categorySlug = (displaySubCategory || 'general').toLowerCase().replace(/\s+/g, '-');
  const href = displaySlug ? `/Pages/${section}/${categorySlug}/${displaySlug}` : '#';

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--primary)] hover:shadow-xl cursor-pointer"
      onClick={() => displaySlug && router.push(href)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--muted)]">
        <Image
          src={displayImage || '/images/placeholder-news.jpg'}
          alt={displayTitle}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.currentTarget as any).src = '/images/placeholder-news.jpg'; }}
        />
        {displayCategory && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-['Inter'] text-[0.625rem] font-bold uppercase tracking-wider text-[var(--primary)] backdrop-blur shadow-sm cursor-default" onClick={(e) => e.stopPropagation()}>
            {displayCategory}
          </span>
        )}
        {displayIsTrending && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 font-['Inter'] text-[0.625rem] font-bold uppercase text-white shadow-sm cursor-default" onClick={(e) => e.stopPropagation()}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" /></svg>
            Trending
          </span>
        )}
        {displayIsVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg">
              <svg className="h-6 w-6 ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 font-['Lora'] text-[1rem] font-bold leading-snug tracking-tight text-[var(--heading-color)] transition-colors duration-300 line-clamp-2 hover:text-[var(--primary)]">
          {displayTitle}
        </h3>

        {displayDate && (
          <div className="mt-auto flex items-center gap-2 text-[0.6875rem] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>{displayDate}</span>
          </div>
        )}

        {(section === "awards" || displayCategory?.toUpperCase() === "AWARDS") && (
          <div className="mt-4 flex gap-2">
            {displayTargetLink && (
              <a
                href={displayTargetLink.startsWith('http') ? displayTargetLink : `https://${displayTargetLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-center font-['Inter'] text-[0.625rem] font-bold text-[var(--heading-color)] transition-all hover:bg-[var(--nav-hover-bg)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                onClick={(e) => e.stopPropagation()}
              >
                More Info
              </a>
            )}
            {displayNominationLink && (
              <a
                href={displayNominationLink.startsWith('http') ? displayNominationLink : `https://${displayNominationLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-center font-['Inter'] text-[0.625rem] font-bold text-white shadow-sm transition-all hover:brightness-110 hover:translate-y-[-1px]"
                onClick={(e) => e.stopPropagation()}
              >
                Nominate
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Plural NewsCards Section Component ---

export const NewsCards: React.FC<NewsCardsProps> = ({
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
      if (!grouped[category]) grouped[category] = [];
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
        nominationLink: item.nominationLink,
        subCategory: item.subCategory
      });
    });
    return Object.entries(grouped).map(([categoryName, items]) => ({
      categoryName,
      items: items.slice(0, maxHeadlines + 1),
      subcategories: []
    }));
  }, [sectionData, section, maxHeadlines]);

  const displayData = contextData;

  const getItemLink = (item: NewsItem, categoryName: string): string => {
    if (!item.slug) return `/news/${item.id}`;
    const itemCategory = item.category || categoryName;
    const itemSection = CATEGORY_TO_SECTION_MAP[itemCategory] || section;
    const itemCategorySlug = itemCategory.toLowerCase().replace(/\s+/g, '-');
    return `/Pages/${itemSection}/${itemCategorySlug}/${item.slug}`;
  };

  const currentColumnClass = columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
    columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  if (displayData.length === 0) return null;

  return (
    <div className="bg-[var(--background)] px-4 py-12 md:px-8">
      <div className={`mx-auto grid max-w-[1400px] gap-6 ${currentColumnClass}`}>
        {displayData.map((categorySection, index) => {
          const featuredItem = categorySection.items[0];
          const headlineItems = categorySection.items.slice(1, maxHeadlines + 1);
          if (!featuredItem) return null;

          return (
            <div
              key={categorySection.categoryName}
              className={`group/card flex flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm transition-all duration-300 hover:shadow-xl ${animationEnabled ? 'animate-fade-in-up' : ''}`}
            >
              <div className="border-b border-[var(--border)] bg-gray-50/50 px-6 py-4">
                <h2 className="m-0 flex items-center gap-2 font-['Lora'] text-lg font-bold uppercase tracking-tight text-[var(--heading-color)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]"></span>
                  {categorySection.categoryName}
                </h2>
              </div>

              <NewsCard item={featuredItem} currentSection={getSectionFromCategory(categorySection.categoryName, section)} />

              {headlineItems.length > 0 && (
                <div className="flex flex-1 flex-col gap-0 px-6 py-2">
                  {headlineItems.map((item, idx) => (
                    <Link
                      key={item.id}
                      href={getItemLink(item, categorySection.categoryName)}
                      className="group/headline flex items-start gap-3 border-b border-[var(--border)] py-4 last:border-none hover:pl-1 transition-all"
                    >
                      <span className="mt-1.5 h-3 w-1 shrink-0 rounded-full bg-red-600 opacity-40 transition-opacity group-hover/headline:opacity-100"></span>
                      <p className="m-0 font-['Lora'] text-sm font-medium leading-normal line-clamp-2 transition-colors group-hover/headline:text-[var(--primary)]">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {showViewMore && (
                <div className="mt-auto border-t border-[var(--border)] p-4">
                  <Link
                    href={`/Pages/${getSectionFromCategory(categorySection.categoryName, section)}/${categorySection.categoryName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex w-full items-center justify-between rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                  >
                    <span>More About {categorySection.categoryName}</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getSectionFromCategory(categoryName: string, fallback: string): string {
  return CATEGORY_TO_SECTION_MAP[categoryName] || fallback;
}

export default NewsCard;
