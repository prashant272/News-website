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
    <div className={styles.articleHeader}>
      <h1 className={styles.title}>{article.title}</h1>

      <p className={styles.subtitle}>{article.subtitle}</p>

      <div className={styles.meta}>
        <span className={styles.author}>
          {article.author || 'Prime Time News'}
        </span>
        <span className={styles.date}>
          {formattedDate}
        </span>
        {article.readTime && (
          <span className={styles.readTime}>
            {article.readTime}
          </span>
        )}
      </div>

      <div className={styles.featuredImage}>
        <Image
          src={article.image}
          alt={article.title}
          width={1200}
          height={675}
          className={styles.image}
          priority
        />
      </div>
    </div>
  );
}
