"use client";

import React, { useState, useEffect } from 'react';
import styles from './BreakingNewsTicker.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface BreakingNewsItem {
    _id: string;
    title: string;
    link?: string;
    createdAt: string;
}

const BreakingNewsTicker: React.FC = () => {
    const router = useRouter();
    const [news, setNews] = useState<BreakingNewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8086";

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${API_BASE}/breaking-news`);
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
        return () => clearInterval(refreshInterval);
    }, [API_BASE]);

    useEffect(() => {
        if (news.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % news.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [news.length]);

    if (loading || news.length === 0) return null;

    const currentNews = news[currentIndex];

    return (
        <div className={styles.tickerWrapper}>
            <div className={styles.container} onClick={() => router.push("/breaking-news")}>
                <div className={styles.label}>
                    <span className={styles.liveDot}></span>
                    BREAKING NEWS
                </div>
                <div className={styles.separator}></div>
                <div className={styles.newsTrack}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNews._id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className={styles.newsItem}
                        >
                            {currentNews.title}
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
