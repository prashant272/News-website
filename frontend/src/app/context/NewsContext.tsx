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

  const [allNews, setAllNews] = useState<NewsItem[] | null>(null);
  const [indiaNews, setIndiaNews] = useState<NewsItem[] | null>(null);
  const [sportsNews, setSportsNews] = useState<NewsItem[] | null>(null);
  const [businessNews, setBusinessNews] = useState<NewsItem[] | null>(null);
  const [lifestyleNews, setLifestyleNews] = useState<NewsItem[] | null>(null);
  const [entertainmentNews, setEntertainmentNews] = useState<NewsItem[] | null>(null);
  const [healthNews, setHealthNews] = useState<NewsItem[] | null>(null);
  const [awardsNews, setAwardsNews] = useState<NewsItem[] | null>(null);
  const [techNews, setTechNews] = useState<NewsItem[] | null>(null);
  const [technologyNews, setTechnologyNews] = useState<NewsItem[] | null>(null);
  const [worldNews, setWorldNews] = useState<NewsItem[] | null>(null);
  const [educationNews, setEducationNews] = useState<NewsItem[] | null>(null);
  const [environmentNews, setEnvironmentNews] = useState<NewsItem[] | null>(null);
  const [scienceNews, setScienceNews] = useState<NewsItem[] | null>(null);
  const [opinionNews, setOpinionNews] = useState<NewsItem[] | null>(null);
  const [autoNews, setAutoNews] = useState<NewsItem[] | null>(null);
  const [travelNews, setTravelNews] = useState<NewsItem[] | null>(null);
  const [stateNews, setStateNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    if (!sections) {
      setAllNews(null);
      setIndiaNews(null);
      setSportsNews(null);
      setBusinessNews(null);
      setLifestyleNews(null);
      setEntertainmentNews(null);
      setHealthNews(null);
      setAwardsNews(null);
      setTechNews(null);
      setTechnologyNews(null);
      setWorldNews(null);
      setEducationNews(null);
      setEnvironmentNews(null);
      setScienceNews(null);
      setOpinionNews(null);
      setAutoNews(null);
      setTravelNews(null);
      setStateNews(null);
      return;
    }

    const technologyData = filterVisibleNews(sections.technology);

    setIndiaNews(filterVisibleNews(sections.india));
    setSportsNews(filterVisibleNews(sections.sports));
    setBusinessNews(filterVisibleNews(sections.business));
    setLifestyleNews(filterVisibleNews(sections.lifestyle));
    setEntertainmentNews(filterVisibleNews(sections.entertainment));
    setHealthNews(filterVisibleNews(sections.health));
    setAwardsNews(filterVisibleNews(sections.awards));
    setTechNews(technologyData);
    setTechnologyNews(technologyData);
    setWorldNews(filterVisibleNews(sections.world));
    setEducationNews(filterVisibleNews(sections.education));
    setEnvironmentNews(filterVisibleNews(sections.environment));
    setScienceNews(filterVisibleNews(sections.science));
    setOpinionNews(filterVisibleNews(sections.opinion));
    setAutoNews(filterVisibleNews(sections.auto));
    setTravelNews(filterVisibleNews(sections.travel));
    setStateNews(filterVisibleNews(sections.state));

    const flattened: NewsItem[] = [];
    const keys: (keyof NewsSections)[] = [
      "india",
      "sports",
      "business",
      "lifestyle",
      "entertainment",
      "health",
      "awards",
      "technology",
      "world",
      "education",
      "environment",
      "science",
      "opinion",
      "auto",
      "travel",
      "state",
    ];

    keys.forEach((key) => {
      const arr = sections[key];
      if (Array.isArray(arr)) {
        const visibleItems = arr.filter((item) => !item.isHidden);
        flattened.push(...visibleItems);
      }
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
    healthNews,
    awardsNews,
    techNews,
    technologyNews,
    worldNews,
    educationNews,
    environmentNews,
    scienceNews,
    opinionNews,
    autoNews,
    travelNews,
    stateNews,
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
