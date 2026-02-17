'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';

export type SectionKey =
  | 'india'
  | 'sports'
  | 'business'
  | 'entertainment'
  | 'lifestyle'
  | 'health'
  | 'technology'
  | 'world'
  | 'education'
  | 'environment'
  | 'science'
  | 'opinion'
  | 'auto'
  | 'travel'
  | 'awards'
  | 'all';

export interface BaseNewsItem {
  id: string;
  title: string;
  image: string;
  slug?: string;
  category?: string;
  subCategory: string;
  displaySubCategory: string;
  section: SectionKey;
  href: string;
  isTrending?: boolean;
  isLatest?: boolean;
  targetLink?: string;
  nominationLink?: string;
}

export interface MoreFromItem extends BaseNewsItem { }
export interface LatestItem extends BaseNewsItem { }
export interface StoryItem extends BaseNewsItem {
  timeAgo?: string;
  author?: string;
  date?: string;
}
export interface GridItem extends BaseNewsItem { }
export interface TopNewsItem extends BaseNewsItem { }

type NewsItemVariant = MoreFromItem | LatestItem | StoryItem | GridItem | TopNewsItem;

function getSectionKey(pathname: string, override?: string): SectionKey {
  if (override && [
    'india', 'sports', 'business', 'entertainment', 'lifestyle', 'health',
    'technology', 'world', 'education', 'environment', 'science', 'opinion', 'auto', 'travel', 'awards'
  ].includes(override)) {
    return override as SectionKey;
  }

  const parts = pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('Pages');
  if (idx !== -1 && parts[idx + 1]) {
    const cand = parts[idx + 1];
    if ([
      'india', 'sports', 'business', 'entertainment', 'lifestyle', 'health',
      'technology', 'world', 'education', 'environment', 'science', 'opinion', 'auto', 'travel', 'awards'
    ].includes(cand)) {
      return cand as SectionKey;
    }
  }
  return 'india';
}

function cleanDisplayText(text: string = ''): string {
  return decodeURIComponent(text)
    .replace(/%26/g, '&')
    .replace(/%20/g, ' ')
    .replace(/%2B/g, '+')
    .trim();
}

function calculateTimeAgo(dateStr?: string): string {
  if (!dateStr) return '1 day ago';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '1 day ago';
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return '1 day ago';
  }
}

interface UseNewsSectionDataOptions<T extends NewsItemVariant = NewsItemVariant> {
  variant?: 'more-from' | 'latest' | 'stories' | 'grid' | 'top';
  overrideSection?: string;
  limit?: number;
  excludeSlug?: string;
  preferTrendingForTop?: boolean;
  topLimit?: number;
  providedItems?: any[];
}

export function useNewsSectionData<T extends NewsItemVariant = NewsItemVariant>({
  variant = 'grid',
  overrideSection,
  limit = 6,
  excludeSlug,
  preferTrendingForTop = true,
  topLimit = 5,
  providedItems,
}: UseNewsSectionDataOptions<T> = {}) {
  const pathname = usePathname();
  const context = useNewsContext();

  const section = useMemo(
    () => getSectionKey(pathname, overrideSection),
    [pathname, overrideSection]
  );

  const rawData = useMemo(() => {
    if (providedItems) return providedItems;
    if (!context) return [];

    switch (section) {
      case 'india': return context.indiaNews ?? [];
      case 'sports': return context.sportsNews ?? [];
      case 'business': return context.businessNews ?? [];
      case 'entertainment': return context.entertainmentNews ?? [];
      case 'lifestyle': return context.lifestyleNews ?? [];
      case 'health': return context.healthNews ?? [];
      case 'technology': return context.technologyNews ?? context.techNews ?? [];
      case 'world': return context.worldNews ?? [];
      case 'education': return context.educationNews ?? [];
      case 'environment': return context.environmentNews ?? [];
      case 'science': return context.scienceNews ?? [];
      case 'opinion': return context.opinionNews ?? [];
      case 'auto': return context.autoNews ?? [];
      case 'travel': return context.travelNews ?? [];
      case 'awards': return context.awardsNews ?? [];
      default: return context.allNews ?? [];
    }
  }, [context, section, providedItems]);

  const filteredData = useMemo(() => {
    let data = [...rawData];
    if (excludeSlug) {
      data = data.filter((item: any) => item.slug !== excludeSlug);
    }
    return data;
  }, [rawData, excludeSlug]);

  const items = useMemo<T[]>(() => {
    const dataToUse = variant === 'top' && preferTrendingForTop
      ? filteredData.filter((item: any) => item.isTrending === true) || filteredData
      : filteredData;

    return dataToUse.slice(0, limit).map((raw: any, idx: number) => {
      const sub = raw.subCategory || section;
      const catSlug = sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const base: BaseNewsItem = {
        id: `${section}-${variant}-${raw.slug || 'no'}-${idx}`,
        title: raw.title || 'Untitled',
        image: getImageSrc(raw.image) || '/images/default-news.jpg',
        slug: raw.slug,
        category: raw.category || section.toUpperCase(),
        subCategory: raw.subCategory || '',
        displaySubCategory: cleanDisplayText(raw.subCategory),
        section,
        href: raw.slug ? `/Pages/${section}/${catSlug}/${raw.slug}` : '#',
        isTrending: !!raw.isTrending,
        isLatest: !!raw.isLatest,
        targetLink: raw.targetLink,
        nominationLink: raw.nominationLink,
      };

      if (variant === 'stories') {
        return {
          ...base,
          timeAgo: calculateTimeAgo(raw.date),
          author: raw.author || 'News Desk',
          date: raw.date,
        } as T;
      }

      return base as T;
    });
  }, [filteredData, section, limit, variant, preferTrendingForTop]);

  const topItems = useMemo<T[]>(() => {
    if (variant !== 'grid') return [] as T[];

    const trending = filteredData.filter((item: any) => item.isTrending === true);
    const source = preferTrendingForTop && trending.length >= topLimit ? trending : filteredData;

    return source.slice(0, topLimit).map((raw: any, idx: number) => {
      const sub = raw.subCategory || section;
      const catSlug = sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      return {
        id: `${section}-top-${raw.slug || 'no'}-${idx}`,
        title: raw.title || 'Untitled',
        image: getImageSrc(raw.image),
        slug: raw.slug,
        category: raw.category || section.toUpperCase(),
        subCategory: raw.subCategory || '',
        displaySubCategory: cleanDisplayText(raw.subCategory),
        section,
        href: raw.slug ? `/Pages/${section}/${catSlug}/${raw.slug}` : '#',
        isTrending: !!raw.isTrending,
        isLatest: !!raw.isLatest,
        targetLink: raw.targetLink,
        nominationLink: raw.nominationLink,
      } as T;
    });
  }, [filteredData, section, topLimit, preferTrendingForTop, variant]);

  return {
    section,
    items,
    topItems,
    isLoading: context?.loading ?? false,
    hasData: items.length > 0 || topItems.length > 0,
  };
}
