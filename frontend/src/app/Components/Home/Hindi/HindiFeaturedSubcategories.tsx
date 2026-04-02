"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HindiFeaturedSubcategories.module.scss';
import { useNewsBySection } from '@/app/hooks/NewsApi';
import { getLocalizedHref } from '@/Utils/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';
import HindiNewsCard from '../../Common/HindiNewsCard/HindiNewsCard';

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
                    news.slice(0, 5).map(item => (
                        <HindiNewsCard 
                            key={item._id} 
                            item={item} 
                            lang={lang} 
                            orientation="horizontal" 
                            compact={true} 
                        />
                    ))
                ) : (
                    <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>कोई समाचार नहीं मिला</div>
                )}
            </div>
        </div>
    );
};

// Big single card for environment
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
                <HindiNewsCard 
                    item={news[0]} 
                    lang={lang} 
                    orientation="vertical" 
                />
            ) : (
                 <div style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>कोई समाचार नहीं मिला</div>
            )}
        </div>
    );
};

const HindiFeaturedSubcategories = () => {
    const { lang } = useLanguage();
    
    return (
        <section className={styles.featuredSection}>
            <div className={styles.grid}>
                <ColumnList title="अर्थव्यवस्था (Economy)" section="economy" />
                <ColumnList title="शासन (Governance)" section="governance" />
                <ColumnBig title="पर्यावरण (Environment)" section="environment" />
            </div>

            {/* Common View All Row */}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <Link 
                    href={getLocalizedHref('/Pages/economy', lang)} 
                    className={styles.viewAllBtn}
                >
                    अर्थव्यवस्था देखें
                </Link>
                <Link 
                    href={getLocalizedHref('/Pages/governance', lang)} 
                    className={styles.viewAllBtn}
                >
                    शासन समाचार देखें
                </Link>
                <Link 
                    href={getLocalizedHref('/Pages/environment', lang)} 
                    className={styles.viewAllBtn}
                >
                    पर्यावरण देखें
                </Link>
            </div>
        </section>
    );
};

export default HindiFeaturedSubcategories;
