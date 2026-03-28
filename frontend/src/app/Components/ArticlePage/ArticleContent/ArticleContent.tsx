import React, { useMemo, useEffect } from 'react';
import styles from './ArticleContent.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';

interface ArticleContentProps {
  content: string;
}

// Strip award-related link lines from ALL articles.
// These are displayed separately via the Awards section in ArticlePageClient.
const sanitizeContent = (html: string): string => {
  if (!html) return html;
  return html
    // Remove full <p> tags that contain nomination/more info patterns
    .replace(/<p[^>]*>\s*More Info\s*:\s*<a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination[^<]*:<\s*a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination\s*\(if applicable\)\s*:[^<]*<a[^>]*>[^<]*<\/a>\s*<\/p>/gi, '')
    // Remove inline phrases without wrapping <p>
    .replace(/More Info\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    .replace(/Nomination\s*\(if applicable\)\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    .replace(/Nomination\s*:\s*<a[^>]*>[^<]*<\/a>/gi, '')
    // Remove leftover label-only lines like <p>More Info:</p>
    .replace(/<p[^>]*>\s*More Info\s*:\s*<\/p>/gi, '')
    .replace(/<p[^>]*>\s*Nomination[^<]*:\s*<\/p>/gi, '');
};

import GoogleAd from '../../Common/GoogleAd/GoogleAd';

export default function ArticleContent({ content }: ArticleContentProps) {
  const { data: ads } = useActiveAds();
  const [currentAdIndex, setCurrentAdIndex] = React.useState(0);

  const inArticleAds = useMemo(() => {
    if (!ads) return [];
    return ads.filter(ad => ad.isActive && (ad.headerImageUrl || ad.placement === 'in-article' || ad.placement === 'header'));
  }, [ads]);

  useEffect(() => {
    if (inArticleAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % inArticleAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [inArticleAds.length]);

  const contentWithAds = useMemo(() => {
    if (!content) return null;
    const cleanContent = sanitizeContent(content);
    
    const paragraphs = cleanContent.split('</p>');
    if (paragraphs.length <= 2) {
      return (
        <div className={styles.articleContent}>
           <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
           <GoogleAd style={{ margin: '20px 0' }} />
        </div>
      );
    }

    // Insert Google Ad after first few paragraphs (e.g. 2nd or 3rd)
    const adPosition = Math.min(2, paragraphs.length - 1);
    const firstPart = paragraphs.slice(0, adPosition).join('</p>') + '</p>';
    const remainingParts = paragraphs.slice(adPosition);

    // Insert Internal Ad at a later midpoint if content is long
    const midPoint = Math.floor(remainingParts.length / 2);
    const middlePart = remainingParts.slice(0, midPoint).join('</p>') + '</p>';
    const lastPart = remainingParts.slice(midPoint).join('</p>');

    const internalAd = inArticleAds[currentAdIndex];

    return (
      <div className={styles.articleContent}>
        <div dangerouslySetInnerHTML={{ __html: firstPart }} />
        
        {/* Primary Google Ad Slot */}
        <div className={styles.googleAdWrapper}>
           <div className={styles.adLabel}>ADVERTISEMENT</div>
           <GoogleAd />
        </div>

        <div dangerouslySetInnerHTML={{ __html: middlePart }} />

        {/* Secondary Internal Ad (Optional if exists) */}
        {internalAd && (
          <div className={styles.inArticleAdWrapper}>
            <div className={styles.adLabel}>COMMERCIAL BREAK</div>
            <div className={styles.adSlide} key={currentAdIndex}>
              <a href={internalAd.link} target="_blank" rel="noopener noreferrer">
                <img src={internalAd.headerImageUrl || internalAd.imageUrl} alt={internalAd.title} className={styles.adImage} />
              </a>
            </div>
          </div>
        )}

        <div dangerouslySetInnerHTML={{ __html: lastPart }} />

        {/* Bottom Google Ad Slot */}
        <GoogleAd style={{ marginTop: '20px' }} />
      </div>
    );
  }, [content, inArticleAds, currentAdIndex]);

  return contentWithAds;
}
