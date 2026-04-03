"use client";
import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import { useLanguage } from '@/app/hooks/useLanguage';
import { getLocalizedHref } from '@/Utils/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HindiTrendingTicker.module.scss';

const HindiTrendingTicker: React.FC = () => {
    const { allNews, loading } = useNewsContext();
    const { lang } = useLanguage();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter unique subcategories from trending news items
    const trendingTags = useMemo(() => {
        if (!allNews || allNews.length === 0) return [];
        
        const trendingItems = allNews.filter((item: any) => item.isTrending === true);
        
        const tags = trendingItems.map((item: any) => {
            const catBase = Array.isArray(item.category) ? item.category[0] : item.category;
            return {
                name: item.subCategory || catBase || 'Trending',
                slug: item.subCategory || catBase,
                parentCategory: catBase
            };
        });
        

        const uniqueTags = Array.from(new Set(tags.map(t => t.name)))
            .map(name => tags.find(t => t.name === name));

        return uniqueTags;
    }, [allNews]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading || trendingTags.length === 0) return null;

    return (
        <section className={styles.trendingTicker}>
            <div className={styles.container}>
                <div className={styles.label}>
                    TRENDING NEWS:
                </div>

                <button className={styles.navBtn} onClick={() => scroll('left')}>
                    <ChevronLeft size={16} />
                </button>

                <div className={styles.tagsContainer} ref={scrollRef}>
                    {trendingTags.map((tag: any, index) => (
                        <Link 
                            key={index} 
                            href={getLocalizedHref(`/Pages/${tag.parentCategory?.toLowerCase()}/${tag.slug?.toString().toLowerCase()}`, lang)}
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
        </section>
    );
};

export default HindiTrendingTicker;
