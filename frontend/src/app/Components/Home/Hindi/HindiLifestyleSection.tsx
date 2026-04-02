"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import styles from './HindiLifestyleSection.module.scss';
import HindiNewsCard from '../../Common/HindiNewsCard/HindiNewsCard';

const ColumnList = ({ title, news, loading, lang }: { title: string, news: any[], loading: boolean, lang: string }) => {
    return (
        <div className={styles.column}>
            <div className={styles.columnHeader}>{title}</div>
            <div className={styles.list}>
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className={styles.listItem}>
                            <div className={`${styles.imgWrapper} ${styles.shimmer}`}></div>
                            <div className={styles.content}>
                                <div className={`${styles.shimmer}`} style={{ width: '100%', height: '16px', marginBottom: '8px' }}></div>
                                <div className={`${styles.shimmer}`} style={{ width: '75%', height: '16px' }}></div>
                            </div>
                        </div>
                    ))
                ) : news && news.length > 0 ? (
                    news.slice(0, 4).map(item => (
                        <HindiNewsCard 
                            key={item._id || item.slug} 
                            item={item} 
                            lang={lang} 
                            orientation="horizontal" 
                            compact={true} 
                        />
                    ))
                ) : (
                    <div className={styles.noNews}>कोई समाचार नहीं मिला</div>
                )}
            </div>
        </div>
    );
};

const HindiLifestyleSection: React.FC = () => {
    const { lifestyleNews, loading } = useNewsContext();
    const { lang } = useLanguage();

    const lists = useMemo(() => {
        if (!lifestyleNews) return { main: [], fashion: [], culture: [] };

        const fashion = lifestyleNews.filter(n => n.subCategory?.toLowerCase().includes('fashion'));
        const culture = lifestyleNews.filter(n => n.subCategory?.toLowerCase().includes('culture'));
        const main = lifestyleNews.filter(n => {
            const sub = n.subCategory?.toLowerCase() || '';
            return !sub.includes('fashion') && !sub.includes('culture');
        });

        return { main, fashion, culture };
    }, [lifestyleNews]);

    return (
        <section className={styles.featuredSection}>
            <div className={styles.sectionHeader}>
                <h2>जीवनशैली एवं संस्कृति (Lifestyle & Culture)</h2>
            </div>

            <div className={styles.grid}>
                <ColumnList 
                    title="मुख्य जीवनशैली (Lifestyle)" 
                    news={lists.main} 
                    loading={loading && lists.main.length === 0} 
                    lang={lang} 
                />
                <ColumnList 
                    title="फैशन (Fashion)" 
                    news={lists.fashion} 
                    loading={loading && lists.fashion.length === 0} 
                    lang={lang} 
                />
                <ColumnList 
                    title="संस्कृति (Culture)" 
                    news={lists.culture} 
                    loading={loading && lists.culture.length === 0} 
                    lang={lang} 
                />
            </div>

            {/* View All Row */}
            <div className={styles.viewMoreContainer}>
                <Link 
                    href={getLocalizedHref('/Pages/lifestyle', lang)} 
                    className={styles.viewAllBtn}
                >
                    जीवनशैली देखें
                </Link>
                <Link 
                    href={getLocalizedHref('/Pages/lifestyle/fashion', lang)} 
                    className={styles.viewAllBtn}
                >
                    फैशन जगत देखें
                </Link>
                <Link 
                    href={getLocalizedHref('/Pages/lifestyle/culture', lang)} 
                    className={styles.viewAllBtn}
                >
                    संस्कृति देखें
                </Link>
            </div>
        </section>
    );
};

export default HindiLifestyleSection;
