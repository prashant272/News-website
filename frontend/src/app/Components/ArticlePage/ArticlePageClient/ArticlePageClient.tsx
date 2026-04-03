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
import BreadcrumbSchema from '../../Common/JSONLD/BreadcrumbSchema';
import SidebarAds from '../../Common/SidebarAds/SidebarAds';
import ReadingProgressBar from '../ReadingProgressBar/ReadingProgressBar';

interface ArticleData {
  id: string | number;
  section: string;
  category: string;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  author?: string;
  authorId?: {
    _id: string;
    name: string;
    ProfilePicture: string;
    designation: string;
  };
  readTime?: string;
  tags?: string[];
  content: string;
  slug: string;
  targetLink?: string;
  nominationLink?: string;
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
  translations?: {
    alsoRead?: string;
    publishedBy?: string;
    moreFrom?: string;
    latestNews?: string;
    mustRead?: string;
    advertisement?: string;
    trendingTags?: string;
  };
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
  category,
  translations = {}
}: ArticlePageClientProps) {

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [
      normalizeUrl(article.image)
    ],
    "datePublished": article.date,
    "dateModified": article.date,
    "author": [{
      "@type": "Person",
      "name": article.author || "Prime Time News"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Prime Time Media",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.primetimemedia.in/logo.png"
      }
    },
    "description": article.subtitle || article.content.substring(0, 150)
  };

  return (
    <div className={styles.articlePage}>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: section.charAt(0).toUpperCase() + section.slice(1), item: `/Pages/${section}` },
          { name: article.title, item: `/Pages/${section}/${Array.isArray(article.category) ? article.category[0] : (article.category || category)}/${article.slug}` }
        ]}
      />
      
      <div className={styles.container}>
        <Breadcrumb
          section={section}
          category={category}
          title={article.title}
        />

        <div className={styles.articleLayout}>
          <div className={styles.mainContent}>
            <ArticleHeader article={article} />
            
            <div className={styles.contentWrapper}>
               <div className={styles.stickyShare}>
                  <SocialShare
                    url={typeof window !== 'undefined' ? window.location.href : `https://www.primetimemedia.in/Pages/${article.section}/${Array.isArray(article.category) ? article.category[0] : (article.category || category)}/${article.slug}`}
                    title={article.title}
                    description={article.subtitle}
                    image={article.image}
                    isArticle={true}
                  />
               </div>
               
               <div className={styles.bodyContent}>
                  <ArticleContent content={article.content} />
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className={styles.tagSection}>
                       <ArticleTags tags={article.tags} />
                    </div>
                  )}

                  {(article.category?.toString().toUpperCase() === "AWARDS" || section?.toUpperCase() === "AWARDS") && (
                    <div className={styles.articleAwardActions}>
                      {article.targetLink && (
                        <a
                          href={article.targetLink.startsWith('http') ? article.targetLink : `https://${article.targetLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.articleMoreInfoBtn}
                        >
                          <span>Visit More Info</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                        </a>
                      )}
                      {article.nominationLink && (
                        <a
                          href={article.nominationLink.startsWith('http') ? article.nominationLink : `https://${article.nominationLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.articleNominationBtn}
                        >
                          <span>Submit Nomination</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}

                   <div className={styles.authorBadgeSection}>
                    {article.authorId ? (
                      <div className={styles.premiumAuthorCard}>
                        <div className={styles.authorImageContainer}>
                          <img
                            src={article.authorId.ProfilePicture || '/default-avatar.png'}
                            alt={article.authorId.name}
                            className={styles.authorProfilePic}
                          />
                        </div>
                        <div className={styles.authorInfo}>
                          <div className={styles.publisherLabel}>{translations.publishedBy || "This article published by"}:</div>
                          <div className={styles.authorNameWrapper}>
                            <h4 className={styles.authorNamePrimary}>{article.authorId.name}</h4>
                            <svg className={styles.verifiedBadge} viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L15.09 5.26L19.44 5.9L20.08 10.25L23.34 13.34L20.08 16.43L19.44 20.78L15.09 21.42L12 24.68L8.91 21.42L4.56 20.78L3.92 16.43L0.66 13.34L3.92 10.25L4.56 5.9L8.91 5.26L12 2Z" fill="#3897f0"/>
                                <path d="M17.5 8.5L10 16L6.5 12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className={styles.authorDistinction}>{article.authorId.designation || 'Editorial Staff'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.authorAttribution}>
                        <span className={styles.authorPrefix}>{translations.publishedBy || "Published by"}:</span>
                        <span className={styles.authorName}>{article.author || 'Prime Time News'}</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <RelatedArticles articles={relatedArticles} title={translations.alsoRead} />
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.stickySidebar}>
              <TopNewsSidebar news={topNews} />
              
              <div className={styles.sidebarAd}>
                 <span className={styles.adLabel}>{translations.advertisement || 'ADVERTISEMENT'}</span>
                 <SidebarAds />
              </div>

              {recommendedStories && recommendedStories.length > 0 && (
                <div className={styles.sidebarRecommended}>
                   <h3 className={styles.sidebarSubheading}>{translations.mustRead || 'MUST READ'}</h3>
                   <RecommendedStories stories={recommendedStories} />
                </div>
              )}
            </div>
          </aside>
        </div>

        <MoreStoriesSection
          sectionTitle={translations.moreFrom || `MORE FROM ${section.toUpperCase()}`}
          overrideSection={section}
          lang={section.toLowerCase() === 'bharat' || section.toLowerCase() === 'india' ? 'hi' : undefined} 
        />
      </div>
    </div>
  );
}