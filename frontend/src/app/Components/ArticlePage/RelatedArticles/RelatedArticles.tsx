import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './RelatedArticles.module.scss';

interface RelatedArticle {
  id: string | number;
  title: string;
  slug: string;
  section?: string;
  category?: string;
  image?: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className={styles.relatedArticles}>
      <h2 className={styles.heading}>Also Read</h2>
      <div className={styles.articlesList}>
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/Pages/${article.section || 'india'}/${article.category || 'general'}/${article.slug}`}
            className={styles.articleItem}
          >
            {article.image && (
              <div className={styles.imageWrapper}>
                <Image
                  src={article.image}
                  alt={article.title}
                  width={120}
                  height={80}
                  className={styles.image}
                />
              </div>
            )}
            <div className={styles.content}>
              <span className={styles.title}>{article.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
