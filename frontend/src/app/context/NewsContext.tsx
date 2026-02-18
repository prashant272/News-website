"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { NewsItem, NewsSections, NewsDocument } from "@/app/services/NewsService";
import { useAllNews } from "@/app/hooks/NewsApi";

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
  if (!newsArray || newsArray.length === 0) return null;
  const filtered = newsArray.filter((item) => !item.isHidden);
  return filtered.length > 0 ? filtered : null;
};

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: rawData, loading, error, refetch } = useAllNews();
  const sections = rawData && rawData.length > 0 ? rawData[0] : null;

  const [newsState, setNewsState] = useState<{ [key: string]: NewsItem[] | null }>({});

  const technologyData = useMemo(() => filterVisibleNews(sections?.technology), [sections?.technology]);

  const flattenedArr = useMemo(() => {
    if (!sections) return null;
    const items: NewsItem[] = [];
    const keys: (keyof NewsSections)[] = [
      "india", "sports", "business", "lifestyle", "entertainment",
      "health", "awards", "technology", "world", "education",
      "environment", "science", "opinion", "auto", "travel", "state",
    ];

    keys.forEach((key) => {
      const arr = sections[key];
      if (Array.isArray(arr)) {
        const visibleItems = arr.filter((item) => !item.isHidden);
        items.push(...visibleItems);
      }
    });
    return items.length > 0 ? items : null;
  }, [sections]);

  useEffect(() => {
    if (!sections) {
      setNewsState({});
      return;
    }

    setNewsState({
      allNews: flattenedArr,
      indiaNews: filterVisibleNews(sections.india),
      sportsNews: filterVisibleNews(sections.sports),
      businessNews: filterVisibleNews(sections.business),
      lifestyleNews: filterVisibleNews(sections.lifestyle),
      entertainmentNews: filterVisibleNews(sections.entertainment),
      healthNews: filterVisibleNews(sections.health),
      awardsNews: filterVisibleNews(sections.awards),
      techNews: technologyData,
      technologyNews: technologyData,
      worldNews: filterVisibleNews(sections.world),
      educationNews: filterVisibleNews(sections.education),
      environmentNews: filterVisibleNews(sections.environment),
      scienceNews: filterVisibleNews(sections.science),
      opinionNews: filterVisibleNews(sections.opinion),
      autoNews: filterVisibleNews(sections.auto),
      travelNews: filterVisibleNews(sections.travel),
      stateNews: filterVisibleNews(sections.state),
    });
  }, [sections, technologyData, flattenedArr]);

  const value: NewsContextType = {
    allNews: newsState.allNews ?? null,
    indiaNews: newsState.indiaNews ?? null,
    sportsNews: newsState.sportsNews ?? null,
    businessNews: newsState.businessNews ?? null,
    lifestyleNews: newsState.lifestyleNews ?? null,
    entertainmentNews: newsState.entertainmentNews ?? null,
    healthNews: newsState.healthNews ?? null,
    awardsNews: newsState.awardsNews ?? null,
    techNews: newsState.techNews ?? null,
    technologyNews: newsState.technologyNews ?? null,
    worldNews: newsState.worldNews ?? null,
    educationNews: newsState.educationNews ?? null,
    environmentNews: newsState.environmentNews ?? null,
    scienceNews: newsState.scienceNews ?? null,
    opinionNews: newsState.opinionNews ?? null,
    autoNews: newsState.autoNews ?? null,
    travelNews: newsState.travelNews ?? null,
    stateNews: newsState.stateNews ?? null,
    sections,
    loading,
    error,
    refetch,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);

  if (context === undefined) {
    throw new Error("useNewsContext must be used within a NewsProvider");
  }

  return context;
};
