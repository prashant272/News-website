"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Reuse the common layout styles built for Featured Subcategories
import styles from './HindiFeaturedSubcategories.module.scss';
import { useNewsContext } from '@/app/context/NewsContext';
import { getLocalizedHref } from '@/Utils/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';

// Helper to format date
const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

const ColumnList = ({ title, news, loading }: { title: string, news: any[], loading: boolean }) => {
    const { lang } = useLanguage();

    return (
        <div className={styles.column}>
            <div className={styles.columnHeader}>{title}</div>
            <div className={styles.list}>
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className={styles.listItem}>
                            <div className={`${styles.imgWrapper} ${styles.shimmer}`}></div>
                            <div className={styles.content}>
                                <div className={`${styles.shimmer}`} style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
                                <div className={`${styles.shimmer}`} style={{ width: '75%', height: '16px', marginBottom: '8px' }}></div>
                                <div className={`${styles.shimmer}`} style={{ width: '50%', height: '12px' }}></div>
                            </div>
                        </div>
                    ))
                ) : news && news.length > 0 ? (
                    news.slice(0, 5).map(item => {
                        const catRaw = Array.isArray(item.category) ? item.category[0] : (item.category || 'sports');
                        const cat = catRaw.toLowerCase();
                        const sub = (item.subCategory || 'general').toLowerCase();
                        return (
                        <Link key={item._id || item.slug} href={getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang)} className={styles.listItem}>
                            <div className={styles.imgWrapper}>
                                <Image
                                    src={item.image || '/placeholder.jpg'}
                                    alt={item.title}
                                    fill
                                    sizes="110px"
                                />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>{item.title}</h3>
                                <div className={styles.meta}>
                                    {item.author ? `${item.author} • ` : ''}
                                    {formatDate(item.createdAt)}
                                </div>
                            </div>
                        </Link>
                        );
                    })
                ) : (
                    <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>कोई समाचार नहीं मिला</div>
                )}
            </div>
        </div>
    );
};

// Big single card for Football
const ColumnBig = ({ title, news, loading }: { title: string, news: any[], loading: boolean }) => {
    const { lang } = useLanguage();

    return (
        <div className={styles.column}>
            <div className={styles.columnHeader}>{title}</div>
            {loading ? (
                <div>
                     <div className={`${styles.bigImgWrapper} ${styles.shimmer}`}></div>
                     <div className={`${styles.shimmer}`} style={{ width: '100%', height: '24px', marginBottom: '12px' }}></div>
                     <div className={`${styles.shimmer}`} style={{ width: '85%', height: '24px', marginBottom: '12px' }}></div>
                     <div className={`${styles.shimmer}`} style={{ width: '40%', height: '16px' }}></div>
                </div>
            ) : news && news.length > 0 ? (
                (() => {
                    const item = news[0];
                    const catRaw = Array.isArray(item.category) ? item.category[0] : (item.category || 'sports');
                    const cat = catRaw.toLowerCase();
                    const sub = (item.subCategory || 'general').toLowerCase();
                    return (
                <Link href={getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang)} className={styles.bigCard}>
                    <div className={styles.bigImgWrapper}>
                        <Image
                            src={item.image || '/placeholder.jpg'}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                    <h3 className={styles.bigTitle}>{item.title}</h3>
                    <div className={styles.bigMeta}>
                         {item.author ? `${item.author} • ` : ''}
                         {formatDate(item.createdAt)}
                    </div>
                </Link>
                );
                })()
            ) : (
                 <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>कोई समाचार नहीं मिला</div>
            )}
        </div>
    );
};

const HindiSportsNews = () => {
    const { sportsNews, loading } = useNewsContext();
    const { lang } = useLanguage();

    const lists = useMemo(() => {
        if (!sportsNews) return { all: [], ipl: [], football: [] };
        
        const all = sportsNews.slice(0, 5);
        const ipl = sportsNews.filter((i: any) => (i.subCategory || '').toLowerCase().includes('ipl')).slice(0, 5);
        const football = sportsNews.filter((i: any) => (i.subCategory || '').toLowerCase().includes('football')).slice(0, 1);

        return { all, ipl, football };
    }, [sportsNews]);

    return (
        <section className={styles.featuredSection}>
            <div className={styles.grid}>
                <ColumnList title="मुख्य खेल (All)" news={lists.all} loading={loading && lists.all.length === 0} />
                <ColumnList title="आईपीएल 2026 (IPL 2026)" news={lists.ipl} loading={loading && lists.ipl.length === 0} />
                <ColumnBig title="फुटबॉल (Football)" news={lists.football} loading={loading && lists.football.length === 0} />
            </div>

            {/* View All Button */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <Link 
                    href={getLocalizedHref('/Pages/sports', lang)} 
                    style={{
                        padding: '12px 32px',
                        background: '#e31e26',
                        color: 'white',
                        borderRadius: '50px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(227, 30, 38, 0.3)'
                    }}
                    onMouseOver={(e: any) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e: any) => e.target.style.transform = 'translateY(0)'}
                >
                    सब देखें (View All)
                </Link>
            </div>
        </section>
    );
};

export default HindiSportsNews;
