import React from 'react';
import Image from 'next/image';
import { formatDateTime } from '@/Utils/Utils';
import styles from './ArticleHeader.module.scss';

interface ArticleHeaderProps {
  article: {
    title: string;
    subtitle: string;
    image: string;
    date: string;
    author?: string;
    readTime?: string;
  };
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const formattedDate = formatDateTime(article.date);

  return (
    <header className={styles.articleHeader}>
      <h1 className={`${styles.title} premium-serif`}>{article.title}</h1>

      {article.subtitle && (
        <p className={`${styles.subtitle} premium-sans`}>{article.subtitle}</p>
      )}

      <div className={styles.meta}>
        <div className={styles.authorSection}>
          <span className={styles.label}>Author:</span>
          <span className={styles.authorName}>
            {article.author || 'Prime Time News'}
          </span>
        </div>
        <div className={styles.timeSection}>
           <span className={styles.date}>{formattedDate}</span>
           {article.readTime && (
             <span className={styles.readTime}>
               {article.readTime}
             </span>
           )}
        </div>
      </div>

      <div className={styles.featuredImageWrapper}>
        <Image
          src={article.image}
          alt={article.title}
          width={1200}
          height={675}
          className={styles.image}
          priority
        />
      </div>
    </header>
  );
}
