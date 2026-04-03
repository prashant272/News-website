"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { useNewsBySection } from '@/app/hooks/NewsApi';
import { getLocalizedHref } from '@/Utils/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';
import styles from './HindiHeroSection.module.scss';
import { HINDI_STATES } from '@/Utils/stateMetadata';

const HindiHeroSection: React.FC = () => {
    const { allNews, loading: contextLoading } = useNewsContext();
    const { lang } = useLanguage();
    const [pinnedNews, setPinnedNews] = useState<any[]>([]);
    
    // For the Premium Sidebar (Right Column) - Fetching from Rajya Samachar
    const { data: regionalNews, loading: regionalLoading } = useNewsBySection('राज्य समाचार', false, 1, 10);

    const loading = contextLoading || regionalLoading;

    // Filter and Sort: Give priority to isLatest/isTrending, then Date
    const sortedNews = useMemo(() => {
        if (!allNews || allNews.length === 0) return [];
        
        const filtered = allNews.filter(item => item.image);
        
        return [...filtered].sort((a: any, b: any) => {
            const priorityA = (a.isLatest || a.isTrending) ? 1 : 0;
            const priorityB = (b.isLatest || b.isTrending) ? 1 : 0;
            
            if (priorityA !== priorityB) return priorityB - priorityA;
            
            const timeA = new Date(a.publishedAt || (a as any).date || a.createdAt || 0).getTime();
            const timeB = new Date(b.publishedAt || (b as any).date || b.createdAt || 0).getTime();
            return timeB - timeA;
        });
    }, [allNews]);

    // Sidebar: Priority to 'Pinned' (User selected) -> 'isLatest' + 'Regional' news
    const sidebarItems = useMemo(() => {
        if (!allNews || allNews.length === 0) return [];

        const promotedRegional = allNews.filter((item: any) => {
            const isLatest = item.isLatest === true;
            const cat = (Array.isArray(item.category) ? item.category[0] : (item.category || '')).toLowerCase();
            const sub = (item.subCategory || '').toLowerCase();
            const st = (item.state || '').toLowerCase();
            
            // Check for Regional / State related keywords in category, subcategory or state fields
            const stateKeywords = HINDI_STATES.flatMap(s => [s.slug, s.name, s.english.toLowerCase()]);
            const isReg = cat.includes('राज्य') || cat.includes('regional') || cat.includes('state') ||
                          stateKeywords.some(kw => sub.includes(kw) || st.includes(kw));
            return isLatest && isReg;
        });

        // Combine Pinned (Session start) + Promoted
        const combined = [...pinnedNews, ...promotedRegional];
        const unique = Array.from(new Set(combined.map(a => a.slug)))
                        .map(slug => combined.find(a => a.slug === slug));

        if (unique.length > 0) {
            return unique.slice(0, 5);
        }

        if (regionalNews && regionalNews.length > 0) {
            return regionalNews.slice(0, 5);
        }

        return [];
    }, [allNews, regionalNews, pinnedNews]);

    if (loading || sortedNews.length === 0) {
        return (
            <section className={styles.hindiHero}>
                <div className={styles.container}>
                    <div className={styles.skeletonBlock}></div>
                    <div className={styles.skeletonBlock}></div>
                    <div className={styles.skeletonBlock}></div>
                </div>
            </section>
        );
    }

    const featured = sortedNews[0];
    const middleStories = sortedNews.slice(1, 6);

    const getUrl = (item: any) => {
        const cat = (Array.isArray(item.category) ? item.category[0] : (item.category || 'news')).toLowerCase();
        const sub = (item.subCategory || 'general').toLowerCase();
        return getLocalizedHref(`/Pages/${cat}/${sub}/${item.slug}`, lang);
    };

    const handlePin = (e: React.MouseEvent, item: any) => {
        e.preventDefault();
        e.stopPropagation();
        setPinnedNews(prev => {
            const exists = prev.find(p => p.slug === item.slug);
            if (exists) return prev;
            return [item, ...prev];
        });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <section className={styles.hindiHero}>
            <div className={styles.container}>
                
                {/* ── 1. MAIN FEATURE (Spotlight) ── */}
                <div className={styles.spotlightColumn}>
                    <div className={styles.featuredArea}>
                        <Link href={getUrl(featured)} className={styles.imageLink}>
                            <div className={styles.imgWrap}>
                                <Image 
                                    src={featured.image || '/placeholder.jpg'} 
                                    alt={featured.title} 
                                    fill 
                                    className={styles.spotlightImg}
                                    priority 
                                />
                            </div>
                        </Link>
                        <div className={styles.featuredInfo}>
                            <Link href={getUrl(featured)}>
                                <h1 className={styles.featuredTitle}>{featured.title}</h1>
                            </Link>
                            <div className={styles.meta}>
                                <span className={styles.author}>{featured.author || 'प्राइम टाइम टीम'}</span>
                                <span className={styles.dot}></span>
                                <span className={styles.date}>{formatDate(featured.publishedAt || (featured as any).date)}</span>
                            </div>
                            <p className={styles.summary}>
                                {featured.summary || (featured.content ? featured.content.substring(0, 180) + '...' : 'लेटेस्ट अपडेट्स और ताज़ा खबरों के लिए हमारे साथ बने रहें।')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── 2. STORIES LIST (Middle Section) ── */}
                <div className={styles.middleColumn}>
                    <div className={styles.storiesList}>
                        {middleStories.map((item) => {
                            const cat = (Array.isArray(item.category) ? item.category[0] : (item.category || '')).toLowerCase();
                            const sub = (item.subCategory || '').toLowerCase();
                            const st = (item.state || '').toLowerCase();
                            const stateKeywords = HINDI_STATES.flatMap(s => [s.slug, s.name, s.english.toLowerCase()]);
                            const isRegional = cat.includes('राज्य') || cat.includes('regional') || 
                                              stateKeywords.some(kw => sub.includes(kw) || st.includes(kw));
                            
                            return (
                                <Link key={item.slug} href={getUrl(item)} className={styles.storyItem}>
                                    <div className={styles.storyImg}>
                                        <Image 
                                            src={item.image || '/placeholder.jpg'} 
                                            alt={item.title} 
                                            fill 
                                            sizes="(max-width: 768px) 100vw, 150px"
                                        />
                                        {isRegional && (
                                            <button 
                                                className={styles.pinBtn} 
                                                onClick={(e) => handlePin(e, item)}
                                                title="राज्य समाचार में जोड़ें"
                                            >
                                                ⭐
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.storyText}>
                                        <h4>{item.title}</h4>
                                        <div className={styles.storyMeta}>
                                            <span>{item.author || 'खबर डेस्क'}</span>
                                            <span className={styles.dot}></span>
                                            <span>{formatDate(item.publishedAt || (item as any).date)}</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ── 3. SIDEBAR (Premium State Section) ── */}
                <div className={styles.sidebarColumn}>
                    <div className={styles.premiumHeader}>
                        <div className={styles.brandTitle}>हमारे राज्य <span>Premium Offering</span></div>
                    </div>

                    <div className={styles.sidebarList}>
                        {sidebarItems.map((item) => (
                            <Link key={item.slug} href={getUrl(item)} className={styles.sidebarItem}>
                                <div className={styles.sidebarImg}>
                                    <Image 
                                        src={item.image || '/placeholder.jpg'} 
                                        alt={item.title} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 150px"
                                    />
                                </div>
                                <div className={styles.sidebarText}>
                                    <span>{item.subCategory || (Array.isArray(item.category) ? item.category[0] : item.category) || 'विशेष'}</span>
                                    <h4>{item.title}</h4>
                                    <div className={styles.sidebarMeta}>
                                        {formatDate(item.publishedAt || (item as any).date)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Link href={getLocalizedHref('/state', lang)} className={styles.sidebarViewAll}>
                        सभी राज्यों की खबरें देखें →
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default HindiHeroSection;
