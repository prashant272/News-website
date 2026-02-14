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

    const technologyData = sections.technology ?? null;
    
    setIndiaNews(sections.india ?? null);
    setSportsNews(sections.sports ?? null);
    setBusinessNews(sections.business ?? null);
    setLifestyleNews(sections.lifestyle ?? null);
    setEntertainmentNews(sections.entertainment ?? null);
    setHealthNews(sections.health ?? null);
    setAwardsNews(sections.awards ?? null);
    setTechNews(technologyData);
    setTechnologyNews(technologyData);
    setWorldNews(sections.world ?? null);
    setEducationNews(sections.education ?? null);
    setEnvironmentNews(sections.environment ?? null);
    setScienceNews(sections.science ?? null);
    setOpinionNews(sections.opinion ?? null);
    setAutoNews(sections.auto ?? null);
    setTravelNews(sections.travel ?? null);
    setStateNews(sections.state ?? null);

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
      "state"
    ];

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
