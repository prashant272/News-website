import React from 'react';
import styles from './ArticleContent.module.scss';

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div
      className={styles.articleContent}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
