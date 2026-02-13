import Image from "next/image";
import Navbar from "./Components/Common/Navbar/Navbar";
import HeroSection from "./Components/Home/HeroSection/HeroSection";
import NewsSection from "./Components/Home/NewsSection/NewsSection";
import NewsList from "./Components/Home/Newslist/Newslist";
import LatestNews from "./Components/Home/LatestNewsSection/LatestNews";
import Sports from "./Components/Home/SportsNewsSection/SportsNews";
import Entertainment from "./Components/Home/EntertainmentNewsSection/EntertainmentNews";
import { VideosSection } from "./Components/Common/VideosSection/VideosSection";
import { PhotosSection } from "./Components/Common/PhotosSection/Photos";
import Footer from "./Components/Common/Footer/Footer";
import NewsCards from "./Components/Common/NewsCard/NewsCard";
import { stateNewsData } from "@/Data/NewsCardData/NewsCardData";
import LifestyleSection from "./Components/Home/Lifestyle/LifestyleSection";
import SocialShare from "./Components/Common/SocialShare/SocialShare";

export default function Home() {
  return (
    <>
      <NewsSection/>
      <NewsList/>
      
      <SocialShare 
        url={typeof window !== 'undefined' ? window.location.href : 'https://yoursite.com'}
        title="Your News Site - Latest Breaking News & Updates"
        description="Get the latest breaking news, sports updates, entertainment stories, lifestyle tips, and more. Your trusted source for news."
        image="/og-image.jpg" 
        isArticle={false}
      />
      
      <LatestNews/>
      <Sports/>
      <Entertainment/>
      <VideosSection/>
      {/* <PhotosSection/> */}
      <LifestyleSection/>
      {/* <NewsCards data={stateNewsData} columns={3} /> */}
      {/* <HeroSection/> */}
            <SocialShare 
        url={typeof window !== 'undefined' ? window.location.href : 'https://yoursite.com'}
        title="Your News Site - Latest Breaking News & Updates"
        description="Get the latest breaking news, sports updates, entertainment stories, lifestyle tips, and more. Your trusted source for news."
        image="/og-image.jpg" 
        isArticle={false}
      />
    </>
  );
}
