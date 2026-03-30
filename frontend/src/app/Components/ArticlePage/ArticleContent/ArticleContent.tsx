'use client';

import React, { useMemo, useState, useEffect } from 'react';
import styles from './ArticleContent.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';

interface ArticleContentProps {
  content: string;
}

// Strip award-related link lines from ALL articles.
const sanitizeContent = (html: string): string => {
  if (!html) return html;
  return html
    .replace(/<p[^>]*>\s*More Info\s*:\s*<a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination[^<]*:<\s*a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination\s*\(if applicable\)\s*:[^<]*<a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    .replace(/More Info\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    .replace(/Nomination\s*\(if applicable\)\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    .replace(/Nomination\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    .replace(/<p[^>]*>\s*More Info\s*:\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination[^<]*:\s*<\/p>/gi, '');
};

const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: ads, loading } = useActiveAds();
  const [internalAd, setInternalAd] = useState<any>(null);
  
  const cleanContent = useMemo(() => sanitizeContent(content), [content]);

  useEffect(() => {
    if (!loading && ads && ads.length > 0) {
      setInternalAd(ads[Math.floor(Math.random() * ads.length)]);
    }
  }, [ads, loading]);

  const paragraphs = useMemo(() => cleanContent.split('</p>'), [cleanContent]);
  
  // Truncation logic: Show 4 paragraphs initially if not expanded
  const cutoff = 4;
  const showReadMore = paragraphs.length > cutoff;

  const renderedContent = useMemo(() => {
    const visibleParagraphs = (!isExpanded && showReadMore) 
      ? paragraphs.slice(0, cutoff) 
      : paragraphs;

    const firstPart = visibleParagraphs.join('</p>') + (visibleParagraphs.length > 0 ? '</p>' : '');

    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: firstPart }} />

        {internalAd && isExpanded && (
          <div className={styles.inArticleAdWrapper}>
            <span className={styles.adLabel}>Promoted Story</span>
            <div className={styles.adSlide}>
              <a href={internalAd.link} target="_blank" rel="noopener noreferrer">
                <img src={internalAd.imageUrl} alt="Advertisement" className={styles.adImage} />
              </a>
            </div>
          </div>
        )}
      </>
    );
  }, [paragraphs, isExpanded, internalAd, showReadMore]);

  return (
    <article className={`${styles.articleContent} ${!isExpanded && showReadMore ? styles.truncated : ''}`}>
      {renderedContent}
      
      {!isExpanded && showReadMore && (
        <div className={styles.readMoreContainer}>
          <button 
            className={styles.readMoreButton}
            onClick={() => setIsExpanded(true)}
          >
            <span>Read Full Article</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
};

export default ArticleContent;
