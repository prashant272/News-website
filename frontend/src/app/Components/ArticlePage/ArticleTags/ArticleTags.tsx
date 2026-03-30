import React from 'react';
import Link from 'next/link';
import styles from './ArticleTags.module.scss';

interface ArticleTagsProps {
  tags: string[];
}

export default function ArticleTags({ tags }: ArticleTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={styles.articleTags}>
      <div className={styles.tagSectionHeader}>
        <span className={styles.tagLabelIcon}>#</span>
        <h4 className={styles.tagsTitle}>Trending Tags</h4>
      </div>

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

      <div className={styles.newsCtaBox}>
        <div className={styles.ctaAccent} />
        <p className={styles.ctaContent}>
          Read all the <Link href="/Pages/all" className={styles.inlineLink}>Breaking News</Link> Live on primetimemedia.in. 
          Follow us for the <Link href="/Pages/all" className={styles.inlineLink}>Latest English News</Link> & updates from the 
          <Link href="/Pages/sports" className={styles.inlineLink}> Sports</Link> world.
        </p>
      </div>
    </div>
  );
}
