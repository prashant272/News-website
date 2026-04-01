"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import styles from './HindiSportsNews.module.scss';

const HindiSportsNews: React.FC = () => {
    const { sportsNews, loading } = useNewsContext();
    const { lang } = useLanguage();
    const [activeFilter, setActiveFilter] = useState('Sports');

    const filters = ['Sports', 'Cricket', 'Football', 'Others'];

    const filteredNews = useMemo(() => {
        if (!sportsNews) return [];
        const active = activeFilter.toLowerCase();
        if (active === 'sports') return sportsNews.slice(0, 4);

        if (active === 'others') {
            return sportsNews.filter(item => {
                const sub = (item.subCategory || '').toLowerCase();
                return !sub.includes('cricket') && !sub.includes('football');
            }).slice(0, 4);
        }

        return sportsNews.filter(item => {
            const sub = (item.subCategory || '').toLowerCase();
            const cat = (item.category || '').toLowerCase();
            return sub.includes(active) || cat.includes(active);
        }).slice(0, 4);
    }, [sportsNews, activeFilter]);

    const getUrl = (item: any) => {
        const cat = (item.category || 'news').toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    if (loading && (!sportsNews || sportsNews.length === 0)) return null;

    return (
        <section className={styles.hindiSports}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.titleWrapper}>
                        <span className={styles.dot}></span>
                        <h2>खेल समाचार</h2>
                    </div>
                    <div className={styles.nav}>
                        {filters.map(f => (
                            <button 
                                key={f}
                                className={`${styles.btn} ${activeFilter === f ? styles.active : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f === 'Sports' ? 'मुख्य' : f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.grid}>
                    {filteredNews.map(item => (
                        <Link href={getUrl(item)} key={item.slug} className={styles.card}>
                            <div className={styles.imgWrap}>
                                <Image src={item.image || '/placeholder.jpg'} alt={item.title} fill />
                            </div>
                            <div className={styles.info}>
                                <span className={styles.cat}>{item.subCategory || 'Sports'}</span>
                                <h3>{item.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className={styles.footer}>
                    <Link href={getLocalizedHref('/Pages/sports', lang)} className={styles.btn}>
                        अधिक खेल समाचार देखें
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HindiSportsNews;
