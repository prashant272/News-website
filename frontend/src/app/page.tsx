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
import WebStories from "./Components/Home/WebStories/WebStories";
import GoogleAd from "./Components/Common/GoogleAd/GoogleAd";

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
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-xl m-8" />}>
        <HeroSection />
      </Suspense>
      <NewsList />
      <WebStories />

      <LatestNews />
      <Sports />
      <div style={{ margin: '30px auto', width: '100%', maxWidth: '1200px', padding: '0 15px' }}>
          <GoogleAd />
      </div>
      <Entertainment />
      <VideosSection />
      <LifestyleSection />

      {/* <SocialShare
        url={typeof window !== 'undefined' ? window.location.href : 'https://www.primetimemedia.in/'}
        title="Prime Time News | Asia's Leading Media House | Breaking News & Live Updates"
        description="Empowering Asia with the fastest breaking news, in-depth reports, and 24/7 live updates on politics, sports, and entertainment."
        image="/og-image.jpg"
        isArticle={false}
      /> */}
    </>
  );
}
