import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumb.module.scss';

interface BreadcrumbProps {
  section: string;
  category: string;
  title: string;
}

export default function Breadcrumb({ section, category, title }: BreadcrumbProps) {
  const sectionStr = Array.isArray(section) ? section[0] : (section || 'news');
  const categoryStr = Array.isArray(category) ? category[0] : (category || 'general');
  
  const sectionSlug = encodeURIComponent(sectionStr.toLowerCase().replace(/\s+/g, '-'));
  const categorySlug = encodeURIComponent(categoryStr.toLowerCase().replace(/\s+/g, '-'));

  return (
    <nav className={styles.breadcrumb}>
      <Link href="/" className={styles.link}>News</Link>
      <span className={styles.separator}>/</span>
      <span className={styles.separator}>Pages</span>

      <span className={styles.separator}>/</span>
      <Link href={`/Pages/${sectionSlug}`} className={styles.link}>
        {sectionStr}
      </Link>
      <span className={styles.separator}>/</span>
      <Link href={`/Pages/${sectionSlug}/${categorySlug}`} className={styles.link}>
        {categoryStr}
      </Link>
      <span className={styles.separator}>/</span>
      <span className={styles.current}>{title}</span>
    </nav>
  );
}
