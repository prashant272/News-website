"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "./Components/Home/HeroSection/HeroSection";
import NewsList from "./Components/Home/Newslist/Newslist";
import LatestNews from "./Components/Home/LatestNewsSection/LatestNews";
import Sports from "./Components/Home/SportsNewsSection/SportsNews";
import Entertainment from "./Components/Home/EntertainmentNewsSection/EntertainmentNews";
import WebStories from "./Components/Home/WebStories/WebStories";
import GoogleAd from "./Components/Common/GoogleAd/GoogleAd";
import { useLanguage } from "./hooks/useLanguage";

// Hindi Components
import HindiHeroSection from "./Components/Home/Hindi/HindiHeroSection";
import HindiTrendingSection from "./Components/Home/Hindi/HindiTrendingSection";
import HindiLatestNews from "./Components/Home/Hindi/HindiLatestNews";
import HindiRegionalNews from "./Components/Home/Hindi/HindiRegionalNews";
import HindiSportsNews from "./Components/Home/Hindi/HindiSportsNews";
import HindiRashifal from "./Components/Home/Hindi/HindiRashifal";
import HindiPoliticsSection from "./Components/Home/Hindi/HindiPoliticsSection";
import HindiEntertainmentNews from "./Components/Home/Hindi/HindiEntertainmentNews";
import HindiCricketSection from "./Components/Home/Hindi/HindiCricketSection";
import HindiFeaturedSubcategories from "./Components/Home/Hindi/HindiFeaturedSubcategories";
import HindiEducationScience from "./Components/Home/Hindi/HindiEducationScience";
import HindiLifestyleSection from "./Components/Home/Hindi/HindiLifestyleSection";

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
