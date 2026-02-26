import React, { useMemo, useEffect } from 'react';
import styles from './ArticleContent.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';

interface ArticleContentProps {
  content: string;
}

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
    if (inArticleAds.length === 0) {
      return <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const paragraphs = content.split('</p>');
    if (paragraphs.length <= 2) {
      return <div className={styles.articleContent} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const midPoint = Math.floor(paragraphs.length / 2);
    const firstHalf = paragraphs.slice(0, midPoint).join('</p>') + '</p>';
    const secondHalf = paragraphs.slice(midPoint).join('</p>');

    const ad = inArticleAds[currentAdIndex];

    return (
      <div className={styles.articleContent}>
        <div dangerouslySetInnerHTML={{ __html: firstHalf }} />

        <div className={styles.inArticleAdWrapper}>
          <div className={styles.adLabel}>ADVERTISEMENT</div>
          <div className={styles.adSlide} key={currentAdIndex}>
            <a href={ad.link} target="_blank" rel="noopener noreferrer">
              <img src={ad.headerImageUrl || ad.imageUrl} alt={ad.title} className={styles.adImage} />
            </a>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
      </div>
    );
  }, [content, inArticleAds, currentAdIndex]);

  return contentWithAds;
}
