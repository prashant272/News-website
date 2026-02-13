'use client';

import React, { useState, useEffect } from 'react';
import styles from './ArticlePageClient.module.scss';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import ArticleHeader from '../ArticleHeader/ArticleHeader';
import ArticleContent from '../ArticleContent/ArticleContent';
import TopNewsSidebar from '../TopNewsSidebar/TopNewsSidebar';
import RelatedArticles from '../RelatedArticles/RelatedArticles';
import ArticleTags from '../ArticleTags/ArticleTags';
import MoreStoriesSection from '../../Common/MoreFromSection/MoreFromSection';
import { useActiveAds } from '@/app/hooks/useAds'; 
import RecommendedStories from '../RecommendedStories/RecommendedStories';
import SocialShare from '../../Common/SocialShare/SocialShare';

interface ArticleData {
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

interface SidebarNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category: string;
}

interface RelatedArticle {
  id: string | number;
  title: string;
  slug: string;
  section?: string;
  category?: string;
  image?: string;
}

interface ArticlePageClientProps {
  article: ArticleData;
  relatedArticles: RelatedArticle[];
  topNews: SidebarNewsItem[];
  recommendedStories: SidebarNewsItem[];
  section: string;
  category: string;
}

const normalizeUrl = (url: string): string => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default function ArticlePageClient({
  article,
  relatedArticles,
  topNews,
  recommendedStories,
  section,
  category
}: ArticlePageClientProps) {
  
  const { data: ads, loading: adsLoading } = useActiveAds();
  const activeAds = (ads || []).filter(ad => ad.isActive);

  const [topAdIndex, setTopAdIndex] = useState(0);
  const [bottomAdIndex, setBottomAdIndex] = useState(activeAds.length > 1 ? 1 : 0);

  useEffect(() => {
    if (activeAds.length <= 1) return;

    const interval = setInterval(() => {
      setTopAdIndex(prev => (prev + 1) % activeAds.length);
      setBottomAdIndex(prev => (prev + 1) % activeAds.length);
    }, 6000); 

    return () => clearInterval(interval);
  }, [activeAds.length]);

  const renderAd = (index: number, minHeight = '250px') => {
    if (adsLoading) {
      return (
        <div className={styles.adPlaceholder} style={{ height: minHeight }}>
          Loading advertisement...
        </div>
      );
    }

    if (activeAds.length === 0) {
      return (
        <div className={styles.adPlaceholder} style={{ height: minHeight }}>
          Advertisement space
        </div>
      );
    }

    const ad = activeAds[index % activeAds.length];
    const adUrl = normalizeUrl(ad.link);
    
    return (
      <div style={{ 
        position: 'relative', 
        height: minHeight, 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <a
          href={adUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', height: '100%' }}
          onClick={(e) => {
            e.preventDefault();
            window.open(adUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          <img
            src={ad.imageUrl}
            alt={ad.title || 'Advertisement'}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
          />
          {ad.title && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(0,0,0,0.65)',
              color: 'white',
              padding: '10px 12px',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: 500,
            }}>
              {ad.title}
            </div>
          )}
        </a>

        {activeAds.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 2,
          }}>
            {activeAds.map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: i === (index % activeAds.length) ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.articlePage}>
      <div className={styles.container}>
        <Breadcrumb 
          section={section}
          category={category}
          title={article.title}
        />

        <div className={styles.articleLayout}>
          <div className={styles.mainContent}>
            <ArticleHeader article={article} />
            <ArticleContent content={article.content} />
            <RelatedArticles articles={relatedArticles} />
            {article.tags && article.tags.length > 0 && (
              <ArticleTags tags={article.tags} />
            )}
            <div className={styles.shareSection}>
    <SocialShare 
    url={typeof window !== 'undefined' ? window.location.href : `https://yoursite.com/${article.section}/${article.category}/${article.slug}`}
    title={article.title}
    description={article.subtitle}
    image={article.image}
    isArticle={true}
  />
  </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.adSpace}>
              <div className={styles.advertisement}>ADVERTISEMENT</div>
              {renderAd(topAdIndex)}
            </div>
            
            <TopNewsSidebar news={topNews} />
            
            <div className={styles.adSpace}>
              <div className={styles.advertisement}>ADVERTISEMENT</div>
              {renderAd(bottomAdIndex, '300px')}
            </div>
          </aside>
        </div>

        <MoreStoriesSection sectionTitle={`MORE FROM ${section.toUpperCase()}`} />
      </div>
    </div>
  );
}
