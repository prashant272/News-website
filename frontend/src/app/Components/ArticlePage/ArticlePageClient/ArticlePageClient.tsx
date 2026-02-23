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

  console.log("[DEBUG] ArticlePageClient data:", {
    id: article.id,
    author: article.author,
    authorId: article.authorId
  });

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

  const renderAd = (index: number) => {
    if (adsLoading) {
      return (
        <div className={styles.adPlaceholder}>
          <span>Loading advertisement...</span>
        </div>
      );
    }

    if (activeAds.length === 0) {
      return (
        <div className={styles.adPlaceholder}>
          <div className={styles.emptyAdBox}>
            <span>AD SPACE</span>
            <small>Will adjust to image size</small>
          </div>
        </div>
      );
    }

    const ad = activeAds[index % activeAds.length];

    return (
      <div className={styles.adWrapper}>
        <a
          href={normalizeUrl(ad.link)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.adLink}
        >
          <img
            src={ad.imageUrl}
            alt={ad.title || 'Advertisement'}
            className={styles.adImage}
            loading="lazy"
          />
        </a>


        {activeAds.length > 1 && (
          <div className={styles.adDots}>
            {activeAds.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (index === topAdIndex) setTopAdIndex(i);
                  else setBottomAdIndex(i);
                }}
                className={`${styles.dot} ${i === (index % activeAds.length) ? styles.activeDot : ''}`}
                aria-label={`Ad ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

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
        "url": "https://www.primetimemedia.in/logo.png" // Replace with actual logo URL if available
      }
    },
    "description": article.subtitle || article.content.substring(0, 150)
  };

  return (
    <div className={styles.articlePage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", item: "/" },
          { name: section.charAt(0).toUpperCase() + section.slice(1), item: `/Pages/${section}` },
          { name: article.title, item: `/Pages/${section}/${category}/${article.slug}` }
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
            <ArticleContent content={article.content} />
            <RelatedArticles articles={relatedArticles} />
            {article.tags && article.tags.length > 0 && (
              <ArticleTags tags={article.tags} />
            )}

            {(article.category?.toUpperCase() === "AWARDS" || section?.toUpperCase() === "AWARDS") && (
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
            <div className={styles.shareSection}>
              <SocialShare
                url={typeof window !== 'undefined' ? window.location.href : `https://www.primetimemedia.in/Pages/${article.section}/${article.category}/${article.slug}`}
                title={article.title}
                description={article.subtitle}
                image={article.image}
                isArticle={true}
              />
              <div className={styles.authorProfileSection}>
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
                      <span className={styles.authorLabel}>Published By</span>
                      <h4 className={styles.authorNamePrimary}>{article.authorId.name}</h4>
                      <p className={styles.authorDistinction}>{article.authorId.designation || 'Senior Editor'}</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.authorAttribution}>
                    <span className={styles.authorPrefix}>Published by:</span>
                    <span className={styles.authorName}>{article.author || 'Prime Time News'}</span>
                  </div>
                )}
              </div>
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
              {renderAd(bottomAdIndex)}
            </div>
          </aside>
        </div>

        <MoreStoriesSection
          sectionTitle={`MORE FROM ${section.toUpperCase()}`}
          overrideSection={section}
        />
      </div>
    </div>
  );
}