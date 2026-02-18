"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Navbar from "./Components/Common/Navbar/Navbar";
import HeroSection from "./Components/Home/HeroSection/HeroSection";
import NewsSection from "./Components/Home/NewsSection/NewsSection";
import NewsList from "./Components/Home/Newslist/Newslist";
import LatestNews from "./Components/Home/LatestNewsSection/LatestNews";
import Sports from "./Components/Home/SportsNewsSection/SportsNews";
import Entertainment from "./Components/Home/EntertainmentNewsSection/EntertainmentNews";
import Footer from "./Components/Common/Footer/Footer";
import NewsCards from "./Components/Common/NewsCard/NewsCard";
import { stateNewsData } from "@/Data/NewsCardData/NewsCardData";
import SocialShare from "./Components/Common/SocialShare/SocialShare";

// Lazy-load heavy sections
const VideosSection = dynamic(() => import("./Components/Common/VideosSection/VideosSection").then(mod => mod.VideosSection), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />,
  ssr: false
});

const LifestyleSection = dynamic(() => import("./Components/Home/Lifestyle/LifestyleSection"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />,
  ssr: false
});

export default function Home() {
  return (
    <>
      <NewsSection />
      <NewsList />

      <LatestNews />
      <Sports />
      <Entertainment />
      <VideosSection />
      <LifestyleSection />

      <SocialShare
        url={typeof window !== 'undefined' ? window.location.href : 'https://primetime-media-news.vercel.app/'}
        title="Prime Time News - Latest Breaking News & Updates"
        description="Get the latest breaking news, sports updates, entertainment stories, lifestyle tips, and more. Your trusted source for news."
        image="/og-image.jpg"
        isArticle={false}
      />
    </>
  );
}
