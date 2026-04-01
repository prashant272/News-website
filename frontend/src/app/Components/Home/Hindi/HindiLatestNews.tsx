"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { formatDateTime } from '@/Utils/Utils';
import { getLocalizedHref } from '@/Utils/navigation';
import styles from './HindiLatestNews.module.scss';
import { ChevronDown } from 'lucide-react';

const HindiLatestNews: React.FC = () => {
    const { allNews, loading } = useNewsContext();
    const { lang } = useLanguage();
    const [visibleCount, setVisibleCount] = useState(8);

    const displayNews = useMemo(() => {
        if (!allNews) return [];
        return allNews.slice(0, visibleCount);
    }, [allNews, visibleCount]);

    const hasMore = allNews ? visibleCount < allNews.length : false;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    if (loading && displayNews.length === 0) return null;

    const getUrl = (item: any) => {
        const cat = (item.category || 'news').toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    return (
        <section className={styles.hindiLatest}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.headerTitle}>Latest</h2>
                    <div className={styles.headerLine}></div>
                </div>

                <div className={styles.newsGrid}>
                    {displayNews.map((item) => (
                        <Link key={item.slug} href={getUrl(item)} className={styles.newsCard}>
                            <div className={styles.imageWrapper}>
                                <Image 
                                    src={item.image || '/placeholder.jpg'} 
                                    alt={item.title} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, 300px"
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.newsTitle}>{item.title}</h3>
                                <span className={styles.source}>{item.author || 'ANI'}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div className={styles.loadMoreContainer}>
                        <button className={styles.loadMoreButton} onClick={handleLoadMore}>
                             More Results <ChevronDown size={18} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HindiLatestNews;
