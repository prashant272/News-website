"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { NewsItem, NewsSections, NewsDocument } from "@/app/services/NewsService";
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

const filterVisibleNews = (newsArray: NewsItem[] | undefined): NewsItem[] | null => {
  if (!newsArray || !Array.isArray(newsArray) || newsArray.length === 0) return null;
  const filtered = newsArray.filter((item) => !item.isHidden);
  return filtered.length > 0 ? filtered : null;
};

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use Streaming for the fastest perceived initial loading experience
  const { news: rawData, loading, error, refetch } = useStreamingNews(undefined, 500);

  const sections = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    const grouped: any = {
      india: [], sports: [], business: [], lifestyle: [], entertainment: [],
      health: [], awards: [], technology: [], world: [], education: [],
      environment: [], science: [], opinion: [], auto: [], travel: [], state: []
    };

    rawData.forEach((item: any) => {
      if (!item.category) return;
      const cat = item.category.toLowerCase().trim();
      if (grouped[cat]) {
        grouped[cat].push(item);
      } else if (cat === 'tech') {
        grouped.technology.push(item);
      }
    });

    return grouped as NewsDocument;
  }, [rawData]);

  // Derive everything from rawData and sections using useMemo
  // This avoids the infinite state update loop
  const newsState = useMemo(() => {
    const safeSections = sections || {};
    return {
      allNews: rawData.length > 0 ? rawData : null,
      indiaNews: filterVisibleNews(safeSections.india) || [],
      sportsNews: filterVisibleNews(safeSections.sports) || [],
      businessNews: filterVisibleNews(safeSections.business) || [],
      lifestyleNews: filterVisibleNews(safeSections.lifestyle) || [],
      entertainmentNews: filterVisibleNews(safeSections.entertainment) || [],
      healthNews: filterVisibleNews(safeSections.health) || [],
      awardsNews: filterVisibleNews(safeSections.awards) || [],
      techNews: filterVisibleNews(safeSections.technology) || [], // Unified field
      technologyNews: filterVisibleNews(safeSections.technology) || [],
      worldNews: filterVisibleNews(safeSections.world) || [],
      educationNews: filterVisibleNews(safeSections.education) || [],
      environmentNews: filterVisibleNews(safeSections.environment) || [],
      scienceNews: filterVisibleNews(safeSections.science) || [],
      opinionNews: filterVisibleNews(safeSections.opinion) || [],
      autoNews: filterVisibleNews(safeSections.auto) || [],
      travelNews: filterVisibleNews(safeSections.travel) || [],
      stateNews: filterVisibleNews(safeSections.state) || [],
    };
  }, [sections, rawData]);

  const value: NewsContextType = useMemo(() => ({
    ...newsState,
    sections,
    loading,
    error,
    refetch,
  }), [newsState, sections, loading, error, refetch]);

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error("useNewsContext must be used within a NewsProvider");
  }
  return context;
};
