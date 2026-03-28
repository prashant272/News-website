"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, useRef } from "react";
import { usePathname } from "next/navigation";
import { NewsItem, NewsDocument } from "@/app/services/NewsService";
import { useStreamingNews } from "@/app/hooks/NewsApi";

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
  
  // Determine if we need the full heavy stream or just essential navbar news
  const isHomePage = pathname === '/';
  
  // Use a smaller limit for non-home pages (Articles, etc.) to save resources
  const streamLimit = isHomePage ? 120 : 10;
  
  const { news: rawData, loading, error, refetch } = useStreamingNews(undefined, streamLimit);
  
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

    // Step 1: Deduplicate and Sort ALL News ONCE
    const seenSlugs = new Set<string>();
    const uniqueSortedAll = sortNewsByDate(rawData.filter(item => {
      const key = item._id || item.slug;
      if (!key || seenSlugs.has(key)) return false;
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

  const value: NewsContextType = useMemo(() => ({
    ...newsState,
    loading,
    error,
    refetch,
  }), [newsState, loading, error, refetch]);

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error("useNewsContext must be used within a NewsProvider");
  }
  return context;
};
