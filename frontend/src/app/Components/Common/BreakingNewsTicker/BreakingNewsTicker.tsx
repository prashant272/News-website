"use client";

import React, { useState, useEffect } from 'react';
import styles from './BreakingNewsTicker.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/app/hooks/useLanguage';

interface BreakingNewsItem {
    _id: string;
    title: string;
    link?: string;
    source?: string;
    createdAt: string;
    scheduledAt?: string;
}

const formatTickerTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return '';
    }
};

const BreakingNewsTicker: React.FC = () => {
    const router = useRouter();
    const [news, setNews] = useState<BreakingNewsItem[]>([]);
    const [liveScores, setLiveScores] = useState<any>({ live: [], upcoming: [], recent: [] });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const { lang, isHindi } = useLanguage();

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.primetimemedia.in";

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/breaking-news?lang=${lang}`);
                if (response.data.success) {
                    setNews(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch breaking news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
        const refreshInterval = setInterval(fetchNews, 600000);

        // SSE for Live Scores
        const eventSource = new EventSource(`${API_BASE}/api/live/live-stream`);
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLiveScores(data || { live: [], upcoming: [], recent: [] });
            } catch (err) {
                console.error("SSE Parse Error", err);
            }
        };

        return () => {
            clearInterval(refreshInterval);
            eventSource.close();
        };
    }, [API_BASE]);

    // Combine for rotation: Live scores first, then news (limited to top 15 total)
    const combinedItems = [
        ...(liveScores.live || []).map((m: any) => ({ _id: m.id, title: `${m.name}: ${m.status}`, isLive: true })),
        ...news
    ].slice(0, 20);

    useEffect(() => {
        if (combinedItems.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % combinedItems.length);
        }, 10000);

        return () => clearInterval(timer);
    }, [combinedItems.length]);

    if (loading || (news.length === 0 && (!liveScores.live || liveScores.live.length === 0))) return null;


    const currentItem = combinedItems[currentIndex % combinedItems.length] as any;

    if (!currentItem) return null;

    return (
        <div className={styles.tickerWrapper}>
            <div className={styles.mobileTitle}>
                <span className={styles.liveDot}></span>
                {currentItem.isLive ? (isHindi ? "लाइव स्कोर" : "LIVE SCORE") : (isHindi ? "ताज़ा खबर" : "BREAKING NEWS")}
            </div>
            <div className={styles.container} onClick={() => router.push(currentItem.isLive ? "/sports/live" : "/breaking-news")}>
                <div className={styles.label}>
                    <span className={styles.liveDot}></span>
                    {currentItem.isLive ? (isHindi ? "लाइव स्कोर" : "LIVE SCORE") : (isHindi ? "ताज़ा खबर" : "BREAKING NEWS")}
                </div>
                <div className={styles.separator}></div>
                <div className={styles.newsTrack}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentItem._id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className={styles.newsItem}
                        >
                            {currentItem.isLive && <span style={{ color: '#ff3b3b', fontWeight: '900', marginRight: '8px' }}>[LIVE]</span>}
                            {!currentItem.isLive && (currentItem.scheduledAt || currentItem.createdAt) && (
                                <span style={{ color: '#ffdbdb', fontWeight: '800', marginRight: '8px' }}>
                                    [{formatTickerTime(currentItem.scheduledAt || currentItem.createdAt)}]
                                </span>
                            )}
                            {currentItem.title}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <button className={styles.closeBtn} onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, you might hide the ticker for the session
                    const wrapper = e.currentTarget.closest(`.${styles.tickerWrapper}`);
                    if (wrapper) (wrapper as HTMLElement).style.display = 'none';
                }}>
                    ✕
                </button>
            </div>
        </div>
    );
};


export default BreakingNewsTicker;
