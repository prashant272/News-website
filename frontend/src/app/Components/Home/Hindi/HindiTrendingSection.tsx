"use client";
import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import styles from './HindiTrendingSection.module.scss';

const HindiTrendingSection: React.FC = () => {
    const { allNews, loading } = useNewsContext();
    const { lang } = useLanguage();
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Data Logic: Filter trending news only
    const trendingData = useMemo(() => {
        if (!allNews || allNews.length === 0) return [];
        return allNews.filter((item: any) => item.isTrending === true);
    }, [allNews]);

    // 2. Ticker Tags: Unique subcategories from all trending news
    const tickerTags = useMemo(() => {
        const tags = trendingData.map((item: any) => {
            const catBase = Array.isArray(item.category) ? item.category[0] : item.category;
            return {
                name: item.subCategory || catBase || 'Trending',
                slug: item.subCategory || catBase,
                parentCategory: catBase
            };
        });
        return Array.from(new Set(tags.map(t => t.name)))
            .map(name => tags.find(t => t.name === name));
    }, [trendingData]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading || trendingData.length === 0) return null;

    // Distribute Trending News among Columns (Mirrors screenshot layout)
    const leftList = trendingData.slice(0, 4);
    const middleCards = trendingData.slice(4, 7);
    const rightSidebar = trendingData.slice(7, 10);

    const getUrl = (item: any) => {
        const catBase = Array.isArray(item.category) ? item.category[0] : (item.category || 'news');
        const cat = catBase.toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    return (
        <section className={styles.hindiTrending}>
            <div className={styles.container}>
                
                {/* ── 1. TICKER BAR ── */}
                <div className={styles.tickerBar}>
                    <div className={styles.label}>TRENDING NEWS:</div>
                    <button className={styles.navBtn} onClick={() => scroll('left')}>
                        <ChevronLeft size={16} />
                    </button>
                    <div className={styles.tagsContainer} ref={scrollRef}>
                        {tickerTags.map((tag: any, index) => (
                            <Link 
                                key={index} 
                                href={getLocalizedHref(`/Pages/all`, lang)} // Can fine-tune filter later
                                className={styles.tag}
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                    <button className={styles.navBtn} onClick={() => scroll('right')}>
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* ── 2. DATA GRID ── */}
                <div className={styles.dataGrid}>
                    
                    {/* Header Row */}
                    <div className={styles.gridHeader}>
                       <span className={styles.redDot}></span>
                       <h2>बड़ी ख़बरें</h2>
                    </div>

                    <div className={styles.innerLayout}>
                        
                        {/* COLUMN 1: Text-only List */}
                        <div className={styles.colLeft}>
                            <div className={styles.textList}>
                                {leftList.map((item, idx) => (
                                    <Link key={idx} href={getUrl(item)} className={styles.listItem}>
                                        <p>{item.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 2: Vertical Image Cards */}
                        <div className={styles.colMiddle}>
                            <div className={styles.cardGrid}>
                                {middleCards.map((item, idx) => (
                                    <Link key={idx} href={getUrl(item)} className={styles.verticalCard}>
                                        <div className={styles.cardImg}>
                                            <Image src={item.image || '/placeholder.jpg'} alt={item.title} fill sizes="300px" />
                                            {(item as any).isVideo && <div className={styles.videoIcon}><Play fill="white" size={12}/></div>}
                                        </div>
                                        <div className={styles.cardInfo}>
                                           <h3>{item.title}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* COLUMN 3: Branded Sidebar Box */}
                        <div className={styles.colRight}>
                            <div className={styles.sidebarBox}>
                                <div className={styles.sidebarHeader}>
                                    <h3>प्राइम टाइम हिंदी</h3>
                                    <Link href="#" className={styles.moreLink}>और भी</Link>
                                </div>
                                <div className={styles.sidebarList}>
                                    {rightSidebar.map((item, idx) => (
                                        <Link key={idx} href={getUrl(item)} className={styles.sidebarItem}>
                                            <div className={styles.sbImg}>
                                                <Image src={item.image || '/placeholder.jpg'} alt={item.title} fill sizes="100px" />
                                            </div>
                                            <p>{item.title}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default HindiTrendingSection;
