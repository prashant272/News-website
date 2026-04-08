"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "./Components/Home/HeroSection/HeroSection";
import NewsList from "./Components/Home/Newslist/Newslist";
import LatestNews from "./Components/Home/LatestNewsSection/LatestNews";
import Sports from "./Components/Home/SportsNewsSection/SportsNews";
import Entertainment from "./Components/Home/EntertainmentNewsSection/EntertainmentNews";
import FeaturesSection from "./Components/Home/FeaturesSection/FeaturesSection";
import WebStories from "./Components/Home/WebStories/WebStories";
import GoogleAd from "./Components/Common/GoogleAd/GoogleAd";
import { useLanguage } from "./hooks/useLanguage";

// Hindi Components
import HindiHeroSection from "./Components/Home/Hindi/HindiHeroSection";
import HindiTrendingSection from "./Components/Home/Hindi/HindiTrendingSection";
import HindiLatestNews from "./Components/Home/Hindi/HindiLatestNews";
import HindiRegionalNews from "./Components/Home/Hindi/HindiRegionalNews";

const HindiSportsNews = dynamic(() => import("./Components/Home/Hindi/HindiSportsNews"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiRashifal = dynamic(() => import("./Components/Home/Hindi/HindiRashifal"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiPoliticsSection = dynamic(() => import("./Components/Home/Hindi/HindiPoliticsSection"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiEntertainmentNews = dynamic(() => import("./Components/Home/Hindi/HindiEntertainmentNews"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiCricketSection = dynamic(() => import("./Components/Home/Hindi/HindiCricketSection"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiFeaturedSubcategories = dynamic(() => import("./Components/Home/Hindi/HindiFeaturedSubcategories"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiEducationScience = dynamic(() => import("./Components/Home/Hindi/HindiEducationScience"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiFeaturesSection = dynamic(() => import("./Components/Home/Hindi/HindiFeaturesSection/HindiFeaturesSection"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });
const HindiLifestyleSection = dynamic(() => import("./Components/Home/Hindi/HindiLifestyleSection"), { loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />, ssr: false });

// Lazy-load heavy sections
const VideosSection = dynamic(() => import("./Components/Common/VideosSection/VideosSection").then(mod => mod.VideosSection), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />,
  ssr: false
});

const EnglishLifestyleSection = dynamic(() => import("./Components/Home/Lifestyle/LifestyleSection"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />,
  ssr: false
});

const EnglishHome = () => (
  <>
    <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />}>
      <HeroSection />
    </Suspense>
    
    <GoogleAd slot="5006567326" format="horizontal" />

    <NewsList />
    <WebStories />

    <LatestNews />
    <Sports />
    
    <FeaturesSection />
    
    <GoogleAd slot="5006567326" format="auto" />

    <Entertainment />
    <VideosSection />
    
    <GoogleAd slot="5006567326" format="horizontal" />

    <EnglishLifestyleSection />
  </>
);

const HindiHome = () => (
  <>
    <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />}>
      <HindiHeroSection />
    </Suspense>

    <HindiTrendingSection />

    <GoogleAd slot="5006567326" format="horizontal" />

    <HindiLatestNews />
    <HindiPoliticsSection />
    <HindiCricketSection />
    <HindiFeaturedSubcategories />
    <HindiEducationScience />
    <HindiFeaturesSection />
    <HindiRashifal />
    
    <GoogleAd slot="5006567326" format="auto" />

    <HindiSportsNews />
    <HindiEntertainmentNews />

    <GoogleAd slot="5006567326" format="auto" />

    <VideosSection />
    <WebStories />
    
    <GoogleAd slot="5006567326" format="horizontal" />

    <HindiLifestyleSection />
  </>
);

export default function HomeClient() {
  const { isHindi, isMounted } = useLanguage();
  
  if (!isMounted) return null;
  
  return isHindi ? <HindiHome /> : <EnglishHome />;
}
