"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, Share2, RotateCcw } from "lucide-react";
import { FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

import styles from "./BreakingNewsPage.module.scss";
import { useLanguage } from "@/app/hooks/useLanguage";

interface BreakingNewsItem {
    _id: string;
    title: string;
    link?: string;
    source?: string;
    createdAt: string;
    scheduledAt?: string;
}

const BreakingNewsPage = () => {
    const [news, setNews] = useState<BreakingNewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { lang, isHindi, isMounted } = useLanguage();

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.primetimemedia.in";

    const fetchNews = async () => {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE}/api/breaking-news?lang=${lang}`);
            if (response.data.success) {
                setNews(response.data.data);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(isHindi ? "सर्वर से कनेक्ट करने में विफल" : "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchNews();
        }
    }, [API_BASE, lang, isMounted]);

    const handleScrape = async () => {
        if (!window.confirm(isHindi ? "क्या आप लाइव स्रोतों से ब्रेकिंग न्यूज़ स्क्रैप करना चाहते हैं?" : "Do you want to scrape real breaking news from live sources?")) return;
        setSeeding(true);
        try {
            const response = await axios.post(`${API_BASE}/api/breaking-news/scrape`);
            if (response.data.success) {
                alert(response.data.message || "Real news scraped! Refreshing...");
                fetchNews();
            }
        } catch (error) {
            alert("Scraping failed: " + (error as any).message);
        } finally {
            setSeeding(false);
        }
    };

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
                <div className={styles.loading}>{isHindi ? "ताज़ा सुर्खियां अपडेट हो रही हैं..." : "Updating live headlines..."}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.errorBox}>
                    <AlertCircle size={48} />
                    <p>{error}</p>
                    <button onClick={() => fetchNews()} className={styles.seedButton}>
                        {isHindi ? "पुनः प्रयास करें" : "Retry"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.breadcrumbBadge}>
                        <span className={styles.category}>{isHindi ? "समाचार" : "News"}</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.badge}>{isHindi ? "ब्रेकिंग न्यूज़" : "Breaking News"}</span>
                    </div>
                    <div className={styles.titleRow}>
                        <h1>{isHindi ? "न्यूज़ फ़्लैश" : "News Flash"} {formatDate(new Date().toISOString())} <RotateCcw size={20} className={styles.refreshIcon} onClick={() => fetchNews()} /></h1>
                        <button
                            className={styles.seedButton}
                            onClick={handleScrape}
                            disabled={seeding}
                        >
                            {seeding ? (isHindi ? "लोड हो रहा है..." : "Loading...") : (isHindi ? "ताज़ा समाचार" : "Latest News")}
                        </button>
                    </div>
                </div>
            </header>

            <div className={styles.newsList}>
                {news.length === 0 ? (
                    <div className={styles.empty}>
                        <AlertCircle size={48} />
                        <p>{isHindi ? "फिलहाल कोई ब्रेकिंग न्यूज़ नहीं है। बाद में वापस आएं!" : "No breaking news at the moment. Check back later!"}</p>
                    </div>
                ) : (
                    news.map((item, index) => (
                        <div key={item._id} className={`${styles.newsItem} ${index === 0 ? styles.featuredItem : ""}`}>
                            <div className={styles.timeBox}>
                                <span className={styles.time}>{formatTime(item.scheduledAt || item.createdAt)}</span>
                            </div>
                            <div className={styles.contentBox}>
                                {item.source && <span className={styles.sourceTag}>{item.source}</span>}
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
