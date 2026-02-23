"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './TagPage.module.scss';

const normalize = (str: string | undefined) =>
    str
        ? decodeURIComponent(str)
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .trim()
        : '';

export default function TagPage() {
    const params = useParams();
    const context = useNewsContext();
    const tagSlug = params?.tagSlug as string;

    const tagName = useMemo(() => {
        if (!tagSlug) return '';
        return decodeURIComponent(tagSlug)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }, [tagSlug]);

    const filteredNews = useMemo(() => {
        if (!tagSlug || !context?.allNews) return [];
        const normTag = normalize(tagSlug);
        return context.allNews.filter((news) => {
            const tags = news.tags || [];
            return tags.some((t) => normalize(t) === normTag);
        });
    }, [tagSlug, context?.allNews]);

    if (!context || context.loading) {
        return (
            <div className={styles.loading}>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (context.error) {
        return (
            <div className={styles.loading}>
                <h2>Error: {context.error}</h2>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.tagLabel}>Tag</span>
                    <h1 className={styles.tagTitle}>#{tagName}</h1>
                    <p className={styles.count}>{filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found</p>
                </div>

                {filteredNews.length === 0 ? (
                    <div className={styles.noResults}>
                        <p>No articles found for &ldquo;{tagName}&rdquo;</p>
                        <Link href="/" className={styles.backLink}>← Go back to Home</Link>
                    </div>
                ) : (
                    <div className={styles.newsGrid}>
                        {filteredNews.map((news, index) => {
                            const section = news.category?.toLowerCase() || 'india';
                            const subCat = news.subCategory || 'general';
                            const href = news.slug
                                ? `/Pages/${section}/${encodeURIComponent(subCat)}/${encodeURIComponent(news.slug)}`
                                : '#';
                            return (
                                <Link key={news._id || index} href={href} className={styles.newsCard}>
                                    <div className={styles.imageWrapper}>
                                        <img
                                            src={getImageSrc(news.image || '')}
                                            alt={news.title}
                                            loading="lazy"
                                        />
                                        {news.category && (
                                            <span className={styles.categoryBadge}>{news.category}</span>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <p className={styles.newsTitle}>{news.title}</p>
                                        {news.summary && (
                                            <p className={styles.newsSummary}>{news.summary.slice(0, 100)}...</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
