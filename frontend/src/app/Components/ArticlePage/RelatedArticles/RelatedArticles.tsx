'use client';

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
  publishedAt?: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className={styles.relatedArticles}>
      <h2 className={styles.heading}>
        <span>Also Read</span>
      </h2>
      <div className={styles.articlesList}>
        {articles.slice(0, 16).map((article) => (
          <Link
            key={article.id}
            href={`/Pages/${article.section || 'news'}/${article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${article.slug}`}
            className={styles.articleItem}
          >
            <div className={styles.imageWrapper}>
               {article.image ? (
                 <Image
                   src={article.image}
                   alt={article.title}
                   width={150}
                   height={100}
                   className={styles.image}
                 />
               ) : (
                 <div className={styles.placeholder} />
               )}
            </div>
            <div className={styles.content}>
              <span className={styles.categoryBadge}>{article.category || article.section || 'Special'}</span>
              <h3 className={styles.title}>{article.title}</h3>
              <div className={styles.meta}>
                 {article.publishedAt && new Date(article.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                 })}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
