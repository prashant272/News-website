"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAllNews, NewsItem, NewsSections, NewsDocument } from "@/app/hooks/NewsApi";

interface NewsContextType {
  allNews: NewsItem[] | null;
  indiaNews: NewsItem[] | null;
  sportsNews: NewsItem[] | null;
  businessNews: NewsItem[] | null;
  lifestyleNews: NewsItem[] | null;
  entertainmentNews: NewsItem[] | null;
  sections: NewsSections | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: rawData, loading, error, refetch } = useAllNews();

  const sections = rawData && rawData.length > 0 ? rawData[0] : null;

  const [allNews, setAllNews] = useState<NewsItem[] | null>(null);
  const [indiaNews, setIndiaNews] = useState<NewsItem[] | null>(null);
  const [sportsNews, setSportsNews] = useState<NewsItem[] | null>(null);
  const [businessNews, setBusinessNews] = useState<NewsItem[] | null>(null);
  const [lifestyleNews, setLifestyleNews] = useState<NewsItem[] | null>(null);
  const [entertainmentNews, setEntertainmentNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    if (!sections) {
      setAllNews(null);
      setIndiaNews(null);
      setSportsNews(null);
      setBusinessNews(null);
      setLifestyleNews(null);
      setEntertainmentNews(null);
      return;
    }

    setIndiaNews(sections.india ?? null);
    setSportsNews(sections.sports ?? null);
    setBusinessNews(sections.business ?? null);
    setLifestyleNews(sections.lifestyle ?? null);
    setEntertainmentNews(sections.entertainment ?? null);

    const flattened: NewsItem[] = [];
    const keys: (keyof NewsSections)[] = ["india", "sports", "business", "lifestyle", "entertainment"];

    keys.forEach((key) => {
      const arr = sections[key];
      if (Array.isArray(arr)) flattened.push(...arr);
    });

    setAllNews(flattened.length > 0 ? flattened : null);
  }, [sections]);

  const value: NewsContextType = {
    allNews,
    indiaNews,
    sportsNews,
    businessNews,
    lifestyleNews,
    entertainmentNews,
    sections,
    loading,
    error,
    refetch,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNewsContext = () => {
  const context = useContext(NewsContext);
  return context;
};