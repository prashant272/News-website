"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import { formatDateTime } from '@/Utils/Utils';
import styles from './HindiPoliticsSection.module.scss';

const HindiPoliticsSection: React.FC = () => {
    const { allNews, loading } = useNewsContext();
    const { lang } = useLanguage();

    // 1. Data Logic: Filter news by subcategory 'politics'
    const politicsNews = useMemo(() => {
        if (!allNews || allNews.length === 0) return [];
        return allNews.filter((item: any) => 
            (item.subCategory || '').toLowerCase() === 'politics' || 
            (item.category || '').toLowerCase().includes('politics')
        );
    }, [allNews]);

    if (loading || politicsNews.length === 0) return null;

    // Distribute News: 1 Main, 5 in List
    const mainStory = politicsNews[0];
    const sideList = politicsNews.slice(1, 6);
    
    // 2. 50-Word Edit: Filter strictly by isFiftyWordEdit flag
    const fiftyWordEditNews = politicsNews.filter((item: any) => item.isFiftyWordEdit === true);
    const mainEdit = fiftyWordEditNews[0];

    const getUrl = (item: any) => {
        const cat = (item.category || 'news').toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    return (
        <section className={styles.politicsSection}>
            <div className={styles.container}>
                <div className={styles.mainLayout}>
                    
                    {/* ── LEFT COLUMN (75%): POLITICS GRID ── */}
                    <div className={styles.leftCol}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.headerTitle}>Politics</h2>
                            <div className={styles.headerLine}></div>
                        </div>

                        <div className={styles.politicsGrid}>
                            {/* Main Featured Story */}
                            {mainStory && (
                                <div className={styles.mainFeature}>
                                    <Link href={getUrl(mainStory)} className={styles.featureCard}>
                                        <div className={styles.imgWrapper}>
                                            <Image 
                                                src={mainStory.image || '/placeholder.jpg'} 
                                                alt={mainStory.title} 
                                                fill 
                                                sizes="(max-width: 768px) 100vw, 600px" 
                                            />
                                        </div>
                                        <div className={styles.content}>
                                            <h3>{mainStory.title}</h3>
                                            <div className={styles.meta}>
                                                <span className={styles.author}>{mainStory.author || 'Primetime'}</span>
                                                <span className={styles.date}>{formatDateTime(mainStory.publishedAt || "")}</span>
                                            </div>
                                            <p className={styles.summary}>
                                                {mainStory.summary || (mainStory.content ? mainStory.content.substring(0, 180).replace(/<[^>]*>/g, '') + '...' : '')}
                                            </p>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* Lateral List of Stories */}
                            <div className={styles.sideList}>
                                {sideList.map((item, idx) => (
                                    <Link key={idx} href={getUrl(item)} className={styles.listItem}>
                                        <h4>{item.title}</h4>
                                        <div className={styles.meta}>
                                            <span className={styles.author}>{item.author || 'Primetime'}</span>
                                            <span className={styles.date}>{formatDateTime(item.publishedAt || "")}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN (25%): 50-WORD EDIT ── */}
                    <div className={styles.rightCol}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.headerTitle}>50-Word Edit</h2>
                            <div className={styles.headerLine}></div>
                        </div>

                        {mainEdit ? (
                            <div className={styles.editBox}>
                                <Link href={getUrl(mainEdit)} className={styles.editContent}>
                                    <h3>{mainEdit.title}</h3>
                                    <div className={styles.meta}>
                                        <span className={styles.author}>{mainEdit.author || 'ThePrint Team'}</span>
                                        <span className={styles.date}>{formatDateTime(mainEdit.publishedAt || "")}</span>
                                    </div>
                                    <p className={styles.desc}>ThePrint view on the most important issues.</p>
                                </Link>
                                {fiftyWordEditNews.slice(1, 3).map((item, i) => (
                                    <Link key={i} href={getUrl(item)} className={styles.smallEditLink}>
                                        <span>•</span> {item.title}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyEdit}>
                                <p>No 50-Word Edits marked yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HindiPoliticsSection;
