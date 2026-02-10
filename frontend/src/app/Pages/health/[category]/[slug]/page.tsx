// app/Pages/sports/[category]/[slug]/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import ArticlePageClient from '@/app/Components/ArticlePage/ArticlePageClient/ArticlePageClient';
import { 
  latestSportsNews, 
  latestIndiaNews,
  latestWorldNews,
  latestBusinessNews,
  latestTechnologyNews,
  latestEntertainmentNews,
  latestLifestyleNews,
  latestHealthNews,
} from '@/Data/NewsData/NewsData';

interface ArticlePageProps {
  params: Promise<{
    section?: string;
    category: string;
    slug: string;
  }>;
}

// Type definition for article data
export interface ArticleData {
  id: string | number;
  section: string;
  category: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  author?: string;
  readTime?: string;
  content: string;
  tags?: string[];
  slug: string;
}

// Type for sidebar news
export interface SidebarNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category: string;
}

// Type for related articles
export interface RelatedArticle {
  id: string | number;
  title: string;
  slug: string;
  section?: string;
  category?: string;
}

// Category to Section mapping
const CATEGORY_TO_SECTION_MAP: Record<string, string> = {
  // Sports categories
  'Cricket': 'sports',
  'Football': 'sports',
  'Tennis': 'sports',
  'Badminton': 'sports',
  'Hockey': 'sports',
  'Athletics': 'sports',
  'Wrestling': 'sports',
  'IPL': 'sports',
  'Olympics': 'sports',
  
  // India categories
  'Maharashtra': 'india',
  'Karnataka': 'india',
  'Delhi': 'india',
  'National': 'india',
  'Punjab': 'india',
  'Gujarat': 'india',
  'Kashmir': 'india',
  'Mumbai': 'india',
  'Uttar Pradesh': 'india',
  'Education': 'india',
  'India': 'india',
  
  // World categories
  'USA': 'world',
  'Europe': 'world',
  'Asia Pacific': 'world',
  'Middle East': 'world',
  'Africa': 'world',
  'Latin America': 'world',
  'Australia': 'world',
  'Climate': 'world',
  
  // Technology categories
  'AI': 'technology',
  'Smartphones': 'technology',
  'Gadgets': 'technology',
  'Computing': 'technology',
  'Technology': 'technology',
  'Electric Vehicles': 'technology',
  'VR/AR': 'technology',
  'Apps': 'technology',
  'Gaming': 'technology',
  'Cybersecurity': 'technology',
  'Space': 'technology',
  
  // Business categories
  'Markets': 'business',
  'Economy': 'business',
  'Banking': 'business',
  'Startups': 'business',
  'Business': 'business',
  'Telecom': 'business',
  'Currency': 'business',
  'IPO': 'business',
  'Real Estate': 'business',
  'Commodities': 'business',
  'Automobile': 'business',
  'Crypto': 'business',
  
  // Entertainment categories
  'Bollywood': 'entertainment',
  'Hollywood': 'entertainment',
  'Music': 'entertainment',
  'OTT': 'entertainment',
  'Entertainment': 'entertainment',
  'Television': 'entertainment',
  'Awards': 'entertainment',
  
  // Lifestyle categories
  'Travel': 'lifestyle',
  'Food': 'lifestyle',
  'Fashion': 'lifestyle',
  'Wellness': 'lifestyle',
  'Health & Fitness': 'lifestyle',
  'Beauty': 'lifestyle',
  
  // Health categories
  'Medical Research': 'health',
  'Mental Health': 'health',
  'Digital Health': 'health',
  'Disease Prevention': 'health',
  'Policy': 'health',
};

// Helper function to get section from category
function getSectionFromCategory(category: string): string {
  return CATEGORY_TO_SECTION_MAP[category] || 'news';
}

// Combine all news data
function getAllNewsData() {
  return [
    ...latestSportsNews,
    ...latestIndiaNews,
    ...latestWorldNews,
    ...latestBusinessNews,
    ...latestTechnologyNews,
    ...latestEntertainmentNews,
    ...latestLifestyleNews,
    ...latestHealthNews
  ];
}

// Find article by slug and return with proper section
function getArticleBySlug(slug: string): ArticleData | null {
  const allNews = getAllNewsData();
  const article = allNews.find((item) => item.slug === slug);
  
  if (!article) return null;

  // Determine section from category
  const section = getSectionFromCategory(article.category);

  // Transform the data to include full article content
  return {
    id: article.id,
    section: section, // Use mapped section
    category: article.category,
    title: article.title,
    subtitle: 'Yuvraj Singh played a massive role in India\'s World Cup wins in 2007 (T20) and 2011 (ODI). However, the second half of his career, especially after surviving cancer, was filled with controversy and he has now revealed the reason for retiring in June 2019.',
    image: article.image,
    date: article.date || new Date().toISOString(),
    author: 'India TV Sports Desk',
    readTime: '5 min read',
    content: generateArticleContent(article.title),
    tags: ['Cricket', 'Yuvraj Singh', 'Indian Cricket', 'Retirement'],
    slug: article.slug
  };
}

// Get related articles based on category
function getRelatedArticles(category: string, currentSlug: string): RelatedArticle[] {
  const allNews = getAllNewsData();
  return allNews
    .filter((item) => item.category === category && item.slug !== currentSlug)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      section: getSectionFromCategory(item.category), // Use mapped section
      category: item.category
    }));
}

// Get top news for sidebar
function getTopNews(): SidebarNewsItem[] {
  const allNews = getAllNewsData();
  return allNews.slice(0, 2).map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    slug: item.slug,
    section: getSectionFromCategory(item.category),
    category: item.category
  }));
}

// Get recommended stories
function getRecommendedStories(): SidebarNewsItem[] {
  const allNews = getAllNewsData();
  return allNews.slice(2, 7).map((item) => ({
    id: item.id,
    title: item.title,
    image: item.image,
    slug: item.slug,
    section: getSectionFromCategory(item.category), 
    category: item.category
  }));
}

// Helper function to generate article content
function generateArticleContent(title: string): string {
  return `
    <p><strong>New Delhi:</strong> Yuvraj Singh is one of the legends in Indian cricket, having played a massive role in India winning the T20 World Cup in 2007 and the ODI World Cup in 2011. In fact, he was the player of the tournament in 2011 when India created history under MS Dhoni. However, after surviving cancer, Yuvraj's career didn't reach its peak again and eventually, he stepped away from the sport in June 2019 after not being picked in the World Cup squad.</p>
    
    <p>He played his last match for India in an ODI against the West Indies in June 2017 and was ignored since then by the selectors and the management. Almost seven years after announcing his retirement, Yuvraj has finally opened up on his decision, stating that he didn't feel respected at the time, which prompted him to step away from cricket.</p>
    
    <p>He also stated that he was not enjoying cricket and also lamented the lack of support then. "I was not enjoying the game. I had a feeling that why am I playing cricket when I'm not enjoying it? I was not feeling supported. I was not feeling respected. And I felt, why do I need to do this when I don't have this? Why am I lingering on to something that I'm not enjoying? Why do I need to play? To prove that?</p>
    
    <p>"I can't do more than this, mentally or physically, and it was hurting me. And the day I stopped, I was myself again," Yuvraj said during a recent podcast with the former India Tennis star Sania Mirza.</p>
    
    <h2>Yuvraj Singh played 304 ODIs, 58 T20Is and 40 Tests for India</h2>
    
    <p>Yuvraj Singh made his debut for India in 2000 and played for a staggering 18 years. He turned up for India in 40 Tests, 304 ODIs and 58 T20Is, amassing 1900, 8701 and 1177 runs respectively, notching up 17 centuries and 71 fifties during his illustrious international career. He also played 132 matches in the Indian Premier League (IPL) for six teams - Mumbai Indians, Punjab Kings, Sunrisers Hyderabad, Delhi Capitals, Royal Challengers Bengaluru, and Pune Warriors India - and scored 2750 runs at a strike rate of almost 130 with 13 fifties to his name.</p>
  `;
}

// Generate static params for all articles
export async function generateStaticParams() {
  const allNews = getAllNewsData();
  
  return allNews.map((article) => ({
    category: article.category.toLowerCase().replace(/\s+/g, '-'),
    slug: article.slug
  }));
}

// Make the component async and await params
export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  // Await params before accessing its properties
  const { slug, category, section: urlSection } = await params;

  // Get article data
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Use section from URL if available, otherwise use section from article data
  const finalSection = urlSection || article.section;

  // Get sidebar and related data
  const relatedArticles = getRelatedArticles(article.category, slug);
  const topNews = getTopNews();
  const recommendedStories = getRecommendedStories();

  return (
    <ArticlePageClient
      article={article}
      relatedArticles={relatedArticles}
      topNews={topNews}
      recommendedStories={recommendedStories}
      section={finalSection}
      category={category}
    />
  );
}
