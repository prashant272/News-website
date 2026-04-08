"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './FeaturesSection.module.scss';
import { useNewsBySection } from '@/app/hooks/NewsApi';
import { getLocalizedHref } from '@/Utils/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';
import { formatDateTime } from '@/Utils/Utils';

const FeaturesSection = () => {
    const { lang } = useLanguage();
    const { data: news, loading } = useNewsBySection('featured', false, 1, 15, "published", lang);

    const bigCardNews = news?.[0];
    const column1News = news?.slice(1, 6) || [];
    const column2News = news?.slice(6, 11) || [];

    return (
        <section className={styles.featuresSection}>
            <div className={styles.sideTitle}>FEATURES</div>
            <div className={styles.container}>
                <div className={styles.sectionHeading}>
                    <span className={styles.line}></span>
                    <h2 className={styles.title}><span className={styles.highlight}>Features</span></h2>
                    <span className={styles.line}></span>
                </div>
                
                <div className={styles.grid}>
                    {/* Big Card Column */}
                    <div className={styles.column}>
                        {loading ? (
                            <div className={styles.bigCardPlaceholder}>
                                <div className={styles.shimmerBigImg}></div>
                                <div className={styles.shimmerBigText}>
                                    <div className={styles.lineLong}></div>
                                    <div className={styles.lineMedium}></div>
                                </div>
                            </div>
                        ) : bigCardNews ? (
                            <Link 
                                href={getLocalizedHref(`/Pages/${(Array.isArray(bigCardNews.category) ? bigCardNews.category[0] : (bigCardNews.category || 'news')).toLowerCase()}/${(bigCardNews.subCategory || 'general').toLowerCase()}/${bigCardNews.slug}`, lang)} 
                                className={styles.bigCard}
                            >
                                <div className={styles.bigImageWrapper}>
                                    <Image
                                        src={bigCardNews.image || '/placeholder.jpg'}
                                        alt={bigCardNews.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 500px"
                                        priority
                                    />
                                    <div className={styles.bigBadge}>Featured</div>
                                </div>
                                <div className={styles.bigContent}>
                                    <h4 className={styles.bigTitle}>{bigCardNews.title}</h4>
                                    <p className={styles.bigExcerpt}>
                                        {bigCardNews.summary ? bigCardNews.summary.substring(0, 120) + '...' : ''}
                                    </p>
                                    <div className={styles.bigFooter}>
                                        <span>{formatDateTime((bigCardNews.publishedAt || bigCardNews.createdAt || '').toString())}</span>
                                        <span className={styles.readMore}>Read More</span>
                                    </div>
                                </div>
                            </Link>
                        ) :null }
                        {/*  if news not found then show null you can change it later */}
                    </div>

                    {/* List Column 1 */}
                    <div className={styles.column}>

                        <div className={styles.list}>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className={styles.listItemPlaceholder}>
                                        <div className={styles.shimmerImg}></div>
                                        <div className={styles.shimmerText}>
                                            <div className={styles.line}></div>
                                            <div className={styles.lineShort}></div>
                                        </div>
                                    </div>
                                ))
                            ) : column1News.length > 0 ? (
                                column1News.map(item => (
                                    <Link 
                                        key={item._id} 
                                        href={getLocalizedHref(`/Pages/${(Array.isArray(item.category) ? item.category[0] : (item.category || 'news')).toLowerCase()}/${(item.subCategory || 'general').toLowerCase()}/${item.slug}`, lang)} 
                                        className={styles.listItem}
                                    >
                                        <div className={styles.listItemImage}>
                                            <Image
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.title}
                                                fill
                                                sizes="100px"
                                            />
                                        </div>
                                        <div className={styles.listItemContent}>
                                            <h4 className={styles.itemTitle}>{item.title}</h4>
                                            <span className={styles.itemDate}>{formatDateTime((item.publishedAt || item.createdAt || '').toString())}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : null }
                        </div>
                    </div>

                    {/* List Column 2 */}
                    <div className={styles.column}>
                        {/* <div className={styles.columnHeader}>
                            <h3>Trending</h3>
                        </div> */}
                        <div className={styles.list}>
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className={styles.listItemPlaceholder}>
                                        <div className={styles.shimmerImg}></div>
                                        <div className={styles.shimmerText}>
                                            <div className={styles.line}></div>
                                            <div className={styles.lineShort}></div>
                                        </div>
                                    </div>
                                ))
                            ) : column2News.length > 0 ? (
                                column2News.map(item => (
                                    <Link 
                                        key={item._id} 
                                        href={getLocalizedHref(`/Pages/${(Array.isArray(item.category) ? item.category[0] : (item.category || 'news')).toLowerCase()}/${(item.subCategory || 'general').toLowerCase()}/${item.slug}`, lang)} 
                                        className={styles.listItem}
                                    >
                                        <div className={styles.listItemImage}>
                                            <Image
                                                src={item.image || '/placeholder.jpg'}
                                                alt={item.title}
                                                fill
                                                sizes="100px"
                                            />
                                        </div>
                                        <div className={styles.listItemContent}>
                                            <h4 className={styles.itemTitle}>{item.title}</h4>
                                            <span className={styles.itemDate}>{formatDateTime((item.publishedAt || item.createdAt || '').toString())}</span>
                                        </div>
                                    </Link>
                                ))
                            ) :null }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
