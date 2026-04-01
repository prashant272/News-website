'use client';

import React from 'react';
import styles from './HindiArticlePage.module.scss';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import ArticleHeader from '../ArticleHeader/ArticleHeader';
import ArticleContent from '../ArticleContent/ArticleContent';
import TopNewsSidebar from '../TopNewsSidebar/TopNewsSidebar';
import RelatedArticles from '../RelatedArticles/RelatedArticles';
import ArticleTags from '../ArticleTags/ArticleTags';
import MoreStoriesSection from '../../Common/MoreFromSection/MoreFromSection';
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

interface HindiArticlePageProps {
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

export default function HindiArticlePage({
  article,
  relatedArticles,
  topNews,
  recommendedStories,
  section,
  category
}: HindiArticlePageProps) {

  // Hindi Translations (Localized directly)
  const translations = {
    alsoRead: "इन्हें भी पढ़ें",
    publishedBy: "द्वारा प्रकाशित",
    moreFrom: `${section.toUpperCase()} से और भी`,
    latestNews: "ताज़ा खबरें",
    mustRead: "ज़रूर पढ़ें",
    advertisement: "विज्ञापन",
    trendingTags: "ट्रेंडिंग टैग्स"
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [normalizeUrl(article.image)],
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
    }
  };

  return (
    <div className={styles.hindiArticlePage}>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className={styles.premiumContainer}>
        <Breadcrumb
          section={section}
          category={category}
          title={article.title}
        />

        <div className={styles.premiumLayout}>
          <div className={styles.mainContent}>
            <ArticleHeader article={article} />
            
            <div className={styles.contentWrapper}>
               <div className={styles.stickyShare}>
                  <SocialShare
                    url={typeof window !== 'undefined' ? window.location.href : `https://www.primetimemedia.in/Pages/${article.section}/${article.category}/${article.slug}`}
                    title={article.title}
                    description={article.subtitle}
                    image={article.image}
                    isArticle={true}
                  />
               </div>
               
               <div className={styles.bodyContent}>
                  <div className={styles.articleContentArea}>
                    <ArticleContent content={article.content} />
                  </div>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className={styles.tagSection}>
                       <ArticleTags tags={article.tags} />
                    </div>
                  )}

                  {/* Awards specific buttons if applicable */}
                   {(article.category?.toUpperCase() === "AWARDS" || section?.toUpperCase() === "AWARDS") && (
                    <div className={styles.articleAwardActions}>
                        {article.targetLink && (
                        <a href={normalizeUrl(article.targetLink)} target="_blank" rel="noopener noreferrer" className={styles.moreInfoBtn}>
                            विवरण देखें
                        </a>
                        )}
                        {article.nominationLink && (
                        <a href={normalizeUrl(article.nominationLink)} target="_blank" rel="noopener noreferrer" className={styles.nominationBtn}>
                            नामांकन भेजें
                        </a>
                        )}
                    </div>
                  )}

                  {/* Author Card (Premium Styling) */}
                  <div className={styles.authorSection}>
                    {article.authorId ? (
                      <div className={styles.premiumAuthorCard}>
                        <img
                          src={article.authorId.ProfilePicture || '/default-avatar.png'}
                          alt={article.authorId.name}
                          className={styles.authorPic}
                        />
                        <div className={styles.authorMeta}>
                          <span className={styles.publishedBy}>{translations.publishedBy}</span>
                          <h4 className={styles.authorName}>{article.authorId.name}</h4>
                          <p className={styles.designation}>{article.authorId.designation || 'संपादकीय विभाग'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.simpleAuthor}>
                        <span>{translations.publishedBy}: <strong>{article.author || 'Prime Time News'}</strong></span>
                      </div>
                    )}
                  </div>
               </div>
            </div>

            <RelatedArticles articles={relatedArticles} title={translations.alsoRead} />
          </div>

          {/* Premium Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.stickySidebar}>
              <div className={styles.sidebarSection}>
                <h3 className={styles.sidebarHeading}>{translations.latestNews}</h3>
                <TopNewsSidebar news={topNews} />
              </div>
              
              <div className={styles.adSpace}>
                 <span className={styles.adLabel}>{translations.advertisement}</span>
                 <SidebarAds />
              </div>

              {recommendedStories && recommendedStories.length > 0 && (
                <div className={styles.sidebarSection}>
                   <h3 className={styles.sidebarHeading}>{translations.mustRead}</h3>
                   <RecommendedStories stories={recommendedStories} />
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className={styles.footerMore}>
            <MoreStoriesSection
                sectionTitle={translations.moreFrom}
                overrideSection={section}
                lang="hi"
            />
        </div>
      </div>
    </div>
  );
}
