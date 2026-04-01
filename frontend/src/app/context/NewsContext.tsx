"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { NewsItem, NewsDocument } from "@/app/services/NewsService";
import { useStreamingNews, useLanguage } from "@/app/hooks/NewsApi";

interface NewsContextType {
  allNews: NewsItem[] | null;
  indiaNews: NewsItem[] | null;
  sportsNews: NewsItem[] | null;
  businessNews: NewsItem[] | null;
  lifestyleNews: NewsItem[] | null;
  entertainmentNews: NewsItem[] | null;
  healthNews: NewsItem[] | null;
  awardsNews: NewsItem[] | null;
  techNews: NewsItem[] | null;
  technologyNews: NewsItem[] | null;
  worldNews: NewsItem[] | null;
  educationNews: NewsItem[] | null;
  environmentNews: NewsItem[] | null;
  scienceNews: NewsItem[] | null;
  opinionNews: NewsItem[] | null;
  autoNews: NewsItem[] | null;
  travelNews: NewsItem[] | null;
  stateNews: NewsItem[] | null;
  sections: NewsDocument | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  selectedAward: NewsItem | null;
  openAwardPopup: (item: NewsItem) => void;
  closeAwardPopup: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

// Helper to sort news once
const sortNewsByDate = (news: NewsItem[]): NewsItem[] => {
  return [...news].sort((a, b) => {
    const getSafeTime = (item: any) => {
      const d = new Date(item.publishedAt || item.date || item.createdAt || 0);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    return getSafeTime(b) - getSafeTime(a);
  });
};

const filterVisibleNews = (newsArray: NewsItem[] | undefined): NewsItem[] | null => {
  if (!newsArray || !Array.isArray(newsArray) || newsArray.length === 0) return null;
  const filtered = newsArray.filter((item) => !item.isHidden);
  return filtered.length > 0 ? filtered : null;
};

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { lang } = useLanguage();
  
  const isHomePage = pathname === '/';
  
  // Use a smaller limit for non-home pages (Articles, etc.) to save resources
  const streamLimit = isHomePage ? 120 : 10;
  
  // We MUST respect 'lang' strictly to avoid mixing English and Hindi
  const { news: rawData, loading, error, refetch } = useStreamingNews(undefined, streamLimit, lang);
  
  // Use a throttle mechanism for context updates? 
  // No, let's just make the processing extremely efficient.
  
  const newsState = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        allNews: null, sections: null, indiaNews: [], sportsNews: [],
        businessNews: [], lifestyleNews: [], entertainmentNews: [],
        healthNews: [], awardsNews: [], techNews: [], technologyNews: [],
        worldNews: [], educationNews: [], environmentNews: [],
        scienceNews: [], opinionNews: [], autoNews: [], travelNews: [], stateNews: []
      };
    }

    // Step 1: Deduplicate, Sort AND Filter by current language strictly
    const seenSlugs = new Set<string>();
    const uniqueSortedAll = sortNewsByDate(rawData.filter(item => {
      const key = item._id || item.slug;
      if (!key || seenSlugs.has(key)) return false;
      
      // Secondary safety: Ensure item language matches current context language
      const itemLang = (item.lang || item.language || '').toLowerCase();
      const content = (item.title || '') + (item.summary || '') + (item.content || '');
      const hasHindiChars = /[\u0900-\u097F]/.test(content);
      
      if (lang === 'hi') {
        // If we are on Hindi portal, allow if tag is 'hi' OR if it has Hindi characters
        if (itemLang !== 'hi' && !hasHindiChars) return false;
      } else {
        // If we are on English portal, strictly exclude Hindi content to keep it clean
        if (itemLang === 'hi' || hasHindiChars) return false;
      }
      
      seenSlugs.add(key);
      return true;
    }));

    // Step 2: Group into sections
    const grouped: any = {
      india: [], sports: [], business: [], lifestyle: [], entertainment: [],
      health: [], awards: [], technology: [], world: [], education: [],
      environment: [], science: [], opinion: [], auto: [], travel: [], state: []
    };

    uniqueSortedAll.forEach((item) => {
      if (!item.category) return;
      const cat = item.category.toLowerCase().trim();
      if (grouped[cat]) {
        grouped[cat].push(item);
      } else if (cat === 'tech') {
        grouped.technology.push(item);
      } else if (cat.includes('award')) {
        grouped.awards.push(item);
      }
    });

    return {
      allNews: uniqueSortedAll,
      sections: grouped as NewsDocument,
      indiaNews: filterVisibleNews(grouped.india) || [],
      sportsNews: filterVisibleNews(grouped.sports) || [],
      businessNews: filterVisibleNews(grouped.business) || [],
      lifestyleNews: filterVisibleNews(grouped.lifestyle) || [],
      entertainmentNews: filterVisibleNews(grouped.entertainment) || [],
      healthNews: filterVisibleNews(grouped.health) || [],
      awardsNews: filterVisibleNews(grouped.awards) || [],
      techNews: filterVisibleNews(grouped.technology) || [],
      technologyNews: filterVisibleNews(grouped.technology) || [],
      worldNews: filterVisibleNews(grouped.world) || [],
      educationNews: filterVisibleNews(grouped.education) || [],
      environmentNews: filterVisibleNews(grouped.environment) || [],
      scienceNews: filterVisibleNews(grouped.science) || [],
      opinionNews: filterVisibleNews(grouped.opinion) || [],
      autoNews: filterVisibleNews(grouped.auto) || [],
      travelNews: filterVisibleNews(grouped.travel) || [],
      stateNews: filterVisibleNews(grouped.state) || [],
    };
  }, [rawData]);

  const [selectedAward, setSelectedAward] = useState<NewsItem | null>(null);

  const openAwardPopup = useCallback((item: NewsItem) => {
    setSelectedAward(item);
  }, []);

  const closeAwardPopup = useCallback(() => {
    setSelectedAward(null);
  }, []);

  const value: NewsContextType = useMemo(() => ({
    ...newsState,
    loading,
    error,
    refetch,
    selectedAward,
    openAwardPopup,
    closeAwardPopup
  }), [newsState, loading, error, refetch, selectedAward, openAwardPopup, closeAwardPopup]);

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error("useNewsContext must be used within a NewsProvider");
  }
  return context;
};
