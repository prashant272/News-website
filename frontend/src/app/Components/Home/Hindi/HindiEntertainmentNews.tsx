"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import styles from './HindiEntertainmentNews.module.scss';

const HindiEntertainmentNews: React.FC = () => {
    const { entertainmentNews, loading } = useNewsContext();
    const { lang } = useLanguage();

    const displayNews = useMemo(() => {
        if (!entertainmentNews) return [];
        return entertainmentNews.slice(0, 3);
    }, [entertainmentNews]);

    const getUrl = (item: any) => {
        const cat = (item.category || 'news').toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    if (loading && (!entertainmentNews || entertainmentNews.length === 0)) return null;

    return (
        <section className={styles.hindiEntertainment}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <h2>मनोरंजन</h2>
                    </div>
                    <Link href={getLocalizedHref('/Pages/entertainment', lang)} className={styles.viewMore}>सभी खबरें</Link>
                </div>

                <div className={styles.grid}>
                    {displayNews.map((item, idx) => (
                        <Link href={getUrl(item)} key={item.slug} className={styles.card}>
                            <Image src={item.image || '/placeholder.jpg'} alt={item.title} fill />
                            <div className={styles.overlay}>
                                <span className={styles.badge}>{item.subCategory || 'Entertainment'}</span>
                                <h3>{item.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HindiEntertainmentNews;
