"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNewsContext } from '@/app/context/NewsContext';
import { useInfiniteNews } from '@/app/hooks/NewsApi';
import LatestNewsSection from '@/app/Components/Common/LatestNewsSection/LatestNewsSection';
import MoreFromSection from '@/app/Components/Common/MoreFromSection/MoreFromSection';
import NewsSection from '@/app/Components/Common/NewsSection/NewsSection';
import { VideosSection } from '@/app/Components/Common/VideosSection/VideosSection';
import SocialShare from '@/app/Components/Common/SocialShare/SocialShare';
import BreadcrumbSchema from '@/app/Components/Common/JSONLD/BreadcrumbSchema';

export default function AllNewsPage() {
    const context = useNewsContext();
    const [currentUrl, setCurrentUrl] = useState<string>('');

    const categoryTitle = "All News";

    // Filtered news for "all" is just allNews from context
    const filteredNews = useMemo(() => {
        return context?.allNews || [];
    }, [context?.allNews]);

    const isFiltering = context.loading || !context?.allNews;

    // Infinite Scroll Logic using the updated 'all' section support
    const {
        items: infiniteNews,
        loading: infiniteLoading,
        hasMore,
        fetchNextPage,
        hasDataChecked,
        isInitialLoading
    } = useInfiniteNews('all', filteredNews);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (infiniteLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [infiniteLoading, hasMore, fetchNextPage]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(window.location.href);
        }
    }, []);

    const transformedNews = infiniteNews.map((news, index) => ({
        id: news._id || news.slug || `news-${index}`,
        image: news.image || '',
        title: news.title,
        slug: news.slug,
        category: news.category,
        subCategory: news.subCategory || '',
        targetLink: news.targetLink,
        nominationLink: news.nominationLink
    }));

    const transformedTrendingNews = (context.allNews || [])
        .filter(news => news.isTrending)
        .slice(0, 5)
        .map((news, index) => ({
            id: news.slug || `trending-${index}`,
            title: news.title,
            image: news.image || '',
            slug: news.slug,
            subCategory: news.subCategory
        }));

    if (!context) {
        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2>Context not available</h2>
            </div>
        );
    }

    if (context.loading || isFiltering || isInitialLoading) {
        return (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Fetching the latest stories directly from our database...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <BreadcrumbSchema
                items={[
                    { name: "Home", item: "/" },
                    { name: "All News", item: "/Pages/all" }
                ]}
            />
            <NewsSection
                sectionTitle={categoryTitle}
                subCategories={[]} // No specific tags for "all"
                mainNews={transformedNews}
                topNews={transformedTrendingNews}
                showSidebar={true}
                gridColumns={3}
            />

            {/* Infinite Scroll Trigger & Loading Indicator */}
            <div ref={lastElementRef} style={{ height: '40px', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {infiniteLoading && (
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Loading more stories...
                    </div>
                )}
                {!hasMore && infiniteNews.length > 0 && (
                    <p className="text-gray-500 text-sm italic">You've reached the end of the news feed.</p>
                )}
            </div>

            <SocialShare
                url={currentUrl || `https://www.primetimemedia.in/Pages/all`}
                title="All News - Latest Breaking News & Updates"
                description="Stay updated with all the latest news, breaking stories, and trending topics from all categories."
                image={infiniteNews[0]?.image || ''}
                isArticle={false}
            />

            <VideosSection />

            <LatestNewsSection
                sectionTitle="Latest Stories"
                showReadMore={false}
                columns={3}
            />

            <MoreFromSection
                sectionTitle="Explore More"
                columns={2}
                limit={8}
            />
        </>
    );
}
