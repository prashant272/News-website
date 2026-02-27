"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Share2, RotateCcw } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";


import styles from "./BreakingNewsPage.module.scss";

interface BreakingNewsItem {
    _id: string;
    title: string;
    link?: string;
    createdAt: string;
}

const BreakingNewsPage = () => {
    const [news, setNews] = useState<BreakingNewsItem[]>([]);
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
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [API_BASE]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loading}>Updating live headlines...</div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.breadcrumbBadge}>
                        <span className={styles.category}>News</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.badge}>Breaking News</span>
                    </div>
                    <div className={styles.titleRow}>
                        <h1>News Flash {formatDate(new Date().toISOString())} <RotateCcw size={20} className={styles.refreshIcon} /></h1>
                    </div>
                </div>
            </header>

            <div className={styles.newsList}>
                {news.length === 0 ? (
                    <div className={styles.empty}>
                        <AlertCircle size={48} />
                        <p>No breaking news at the moment. Check back later!</p>
                    </div>
                ) : (
                    news.map((item, index) => (
                        <div key={item._id} className={`${styles.newsItem} ${index === 0 ? styles.featuredItem : ""}`}>
                            <div className={styles.timeBox}>
                                <span className={styles.time}>{formatTime(item.createdAt)}</span>
                            </div>
                            <div className={styles.contentBox}>
                                <h2>{item.title}</h2>
                            </div>
                            <div className={styles.shareButtons}>
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(item.title)}`, '_blank');
                                    }}
                                    className={`${styles.shareIcon} ${styles.facebook}`}
                                    title="Share on Facebook"
                                >
                                    <FaFacebook size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className={`${styles.shareIcon} ${styles.xTwitter}`}
                                    title="Share on X (Twitter)"
                                >
                                    <FaXTwitter size={18} />
                                </button>
                                <button
                                    onClick={() => {
                                        const url = window.location.href;
                                        window.open(`https://wa.me/?text=${encodeURIComponent(item.title + " " + url)}`, '_blank');
                                    }}
                                    className={`${styles.shareIcon} ${styles.whatsapp}`}
                                    title="Share on WhatsApp"
                                >
                                    <FaWhatsapp size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BreakingNewsPage;
