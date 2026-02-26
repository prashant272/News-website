import React from 'react';
import Link from 'next/link';
import styles from './ArticleTags.module.scss';

interface ArticleTagsProps {
  tags: string[];
}

export default function ArticleTags({ tags }: ArticleTagsProps) {
  return (
    <div className={styles.articleTags}>
      <div className={styles.tagsList}>
        {tags.map((tag) => {
          const tagSlug = encodeURIComponent(
            tag.toLowerCase().trim()
              .replace(/&/g, 'and')
              .replace(/\s+/g, '-')
          );
          return (
            <Link
              key={tag}
              href={`/tag/${tagSlug}`}
              className={styles.tag}
            >
              {tag}
            </Link>
          );
        })}
      </div>

      <div className={styles.bottomCta}>
        <p className={styles.ctaText}>
          Read all the <Link href="/Pages/all" className={styles.link}>Breaking News</Link> Live on primetimemedia.in and Get <Link href="/Pages/all" className={styles.link}>Latest English News</Link> & Updates from <Link href="/Pages/sports" className={styles.link}>Sports</Link> Section
        </p>
      </div>
    </div>
  );
}
