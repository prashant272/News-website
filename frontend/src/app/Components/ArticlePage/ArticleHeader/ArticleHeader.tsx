import React from 'react';
import Image from 'next/image';
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
  const formattedDate = new Date(article.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.articleHeader}>
      <h1 className={styles.title}>{article.title}</h1>
      
      <p className={styles.subtitle}>{article.subtitle}</p>

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
