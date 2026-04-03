"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { newsService, NewsItem } from '@/app/services/NewsService';
import { getImageSrc } from '@/Utils/imageUtils';
import styles from './TagPage.module.scss';
import Image from 'next/image';

export default function TagPage() {
    const params = useParams();
    const tagSlug = params?.tagSlug as string;
    
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const tagName = useMemo(() => {
        if (!tagSlug) return '';
        return decodeURIComponent(tagSlug)
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }, [tagSlug]);

    useEffect(() => {
        if (!tagSlug) return;

        async function fetchTaggedNews() {
            setLoading(true);
            try {
                // Use searchNews API which is much faster than client-side filtering
                const res = await newsService.searchNews(tagName, 1, 24);
                if (res.success) {
                    setNews(res.news || []);
                } else {
                    setError(res.msg || "Failed to fetch news");
                }
            } catch (err: any) {
                console.error("Tag fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchTaggedNews();
    }, [tagSlug, tagName]);

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <div className={styles.container}>
                    <div className={styles.skeletonHeader} />
                    <div className={styles.newsGrid}>
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className={styles.skeletonCard} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <Link href="/" className={styles.backLink}>Go back Home</Link>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.tagBadge}>TOPIC</div>
                    <h1 className={styles.tagTitle}>#{tagName}</h1>
                    <div className={styles.stats}>
                       <span className={styles.count}>{news.length}</span>
                       <span className={styles.label}>Articles Found</span>
                    </div>
                </div>

                {news.length === 0 ? (
                    <div className={styles.noResults}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3>No articles found</h3>
                        <p>We couldn't find any articles tagged with &ldquo;{tagName}&rdquo;</p>
                        <Link href="/" className={styles.backLink}>← Back to Home</Link>
                    </div>
                ) : (
                    <div className={styles.newsGrid}>
                        {news.map((item) => {
                            const categoryBase = Array.isArray(item.category) ? item.category[0] : (item.category || 'india');
                            const section = categoryBase.toLowerCase();
                            const subCat = (item.subCategory || 'general').toLowerCase().replace(/\s+/g, '-');
                            const href = item.slug ? `/Pages/${section}/${subCat}/${item.slug}` : '#';
                            
                            return (
                                <Link key={item._id} href={href} className={styles.newsCard}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={getImageSrc(item.image || '')}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className={styles.cardImg}
                                        />
                                        <div className={styles.categoryLabel}>{Array.isArray(item.category) ? item.category[0] : item.category}</div>
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.title}>{item.title}</h3>
                                        <div className={styles.footer}>
                                           <span className={styles.author}>{item.author || 'Prime Time News'}</span>
                                           <span className={styles.dot} />
                                           <span className={styles.date}>
                                              {new Date(item.publishedAt || item.createdAt || "").toLocaleDateString('en-IN', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric'
                                              })}
                                           </span>
                                        </div>
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
