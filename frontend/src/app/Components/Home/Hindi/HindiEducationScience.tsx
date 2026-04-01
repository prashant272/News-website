"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HindiEducationScience.module.scss';
import { useNewsBySection } from '@/app/hooks/NewsApi';
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

const ColumnList = ({ title, section }: { title: string, section: string }) => {
    const { lang } = useLanguage();
    const { data: news, loading } = useNewsBySection(section, false, 1, 5, "published", lang);

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
                        const cat = (item.category || section).toLowerCase();
                        const sub = (item.subCategory || 'general').toLowerCase();
                        return (
                        <Link key={item._id} href={getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang)} className={styles.listItem}>
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

// Big single card for environment/science
const ColumnBig = ({ title, section }: { title: string, section: string }) => {
    const { lang } = useLanguage();
    const { data: news, loading } = useNewsBySection(section, false, 1, 1, "published", lang);

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
                    const cat = (item.category || section).toLowerCase();
                    const sub = (item.subCategory || 'general').toLowerCase();
                    return (
                <Link href={getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang)} className={styles.bigCard}>
                    <div className={styles.bigImgWrapper}>
                        <Image
                            src={news[0].image || '/placeholder.jpg'}
                            alt={news[0].title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>
                    <h3 className={styles.bigTitle}>{news[0].title}</h3>
                    <div className={styles.bigMeta}>
                         {news[0].author ? `${news[0].author} • ` : ''}
                         {formatDate(news[0].createdAt)}
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

const HindiEducationScience = () => {
    return (
        <section className={styles.featuredSection}>
            <div className={styles.grid}>
                <ColumnList title="शिक्षा (Education)" section="education" />
                <ColumnList title="करियर (Careers)" section="careers" />
                <ColumnBig title="विज्ञान (Science)" section="science" />
            </div>
        </section>
    );
};

export default HindiEducationScience;
