"use client";
import React, { useState, useEffect, useCallback } from "react";
import { API } from "@/Utils/Utils";
import { NewsItem } from "@/app/hooks/NewsApi";
import styles from "./AINewsManagement.module.scss";

interface AIDraft extends NewsItem {
    category: string;
    lang: "en" | "hi";
}

interface AINewsManagementProps {
    onEdit: (item: NewsItem) => void;
    isSuperAdmin?: boolean;
}

export default function AINewsManagement({ onEdit, isSuperAdmin }: AINewsManagementProps) {
    const [drafts, setDrafts] = useState<AIDraft[]>([]);
    const [loading, setLoading] = useState(true);

    const [scraping, setScraping] = useState(false);
    const [langFilter, setLangFilter] = useState<"all" | "en" | "hi">("all");

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get("/api/auto-news/drafts");
            if (res.data.success) {
                setDrafts(res.data.drafts);
            }
        } catch (error) {
            console.error("Failed to fetch drafts", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleScrap = async () => {
        setScraping(true);
        console.log(`[FrontEnd] Triggering Scraping: /api/auto-news/fetch-daily`);
        try {
            const res = await API.get("/api/auto-news/fetch-daily");
            console.log("[FrontEnd] API Response:", res.data);
            if (res.data.success) {
                alert(`Scraping completed! Processed: ${res.data.stats.processed}, Duplicates: ${res.data.stats.duplicates}`);
                fetchDrafts();
            }
        } catch (error: any) {
            console.error("Scraping failed", error);
            const errMsg = error.response?.data?.error || error.message;
            alert(`Scraping failed: ${errMsg}`);
        } finally {
            setScraping(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    const handlePublish = async (item: AIDraft) => {
        if (!confirm(`Are you sure you want to publish "${item.title}"?`)) return;
        try {
            // Update status to published
            await API.put(`/news/updatenews/${item.category}/${item.slug}`, {
                status: "published",
                isHidden: false,
            });
            alert("News published successfully!");
            fetchDrafts();
        } catch (err) {
            alert("Failed to publish news.");
            console.error(err);
        }
    };

    const handleDelete = async (item: AIDraft) => {
        if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
        try {
            await API.delete(`/news/deletenews/${item.category}/${item.slug}`);
            alert("Draft deleted successfully!");
            fetchDrafts();
        } catch (err) {
            alert("Failed to delete draft.");
            console.error(err);
        }
    };

    if (loading && drafts.length === 0) return <div className={styles.loading}>Loading AI Drafts...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>🤖 AI Generated Drafts ({drafts.length})</h2>
                <div className={styles.headerActions}>
                    {isSuperAdmin && (
                        <button
                            onClick={handleScrap}
                            className={styles.scrapBtn}
                            disabled={scraping}
                        >
                            {scraping ? "Scraping..." : "Scrap News"}
                        </button>
                    )}
                    <select 
                        className={styles.langFilter} 
                        value={langFilter} 
                        onChange={(e) => setLangFilter(e.target.value as any)}
                    >
                        <option value="all">🌐 All Languages</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="hi">🇮🇳 Hindi</option>
                    </select>
                    <button onClick={fetchDrafts} className={styles.refreshBtn}>Refresh</button>
                </div>
            </div>

            <div className={styles.grid}>
                {drafts
                    .filter(d => langFilter === "all" || d.lang === langFilter)
                    .map((draft, index) => (
                    <div key={`${draft.slug}-${index}`} className={styles.card}>
                        {/* Article Image */}
                        <div className={styles.cardImage}>
                            {draft.image ? (
                                <img src={draft.image} alt={draft.title} />
                            ) : (
                                <div className={styles.noImage}>
                                    <span>{Array.isArray(draft.category) ? draft.category[0]?.toUpperCase() : draft.category?.toUpperCase() || 'AI'}</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.cardHeader}>
                            <span className={styles.badge}>{Array.isArray(draft.category) ? draft.category.join(', ') : draft.category}</span>
                            <span className={`${styles.langBadge} ${styles[draft.lang || 'en']}`}>
                                {draft.lang === 'hi' ? '🇮🇳 HI' : '🇺🇸 EN'}
                            </span>
                            <span className={styles.badgeSource}>{draft.source || "AI"}</span>
                        </div>
                        <h3>{draft.title}</h3>
                        <p>{draft.summary ? draft.summary.substring(0, 100) + '...' : draft.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}</p>
                        <div className={styles.cardActions}>
                            <button onClick={() => onEdit(draft)}>Edit</button>
                            <button className={styles.publishBtn} onClick={() => handlePublish(draft)}>Publish</button>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(draft)}>Delete</button>
                        </div>
                    </div>
                ))}
                {drafts.length === 0 && <p>No AI drafts found. Trigger the fetcher!</p>}
            </div>
        </div>
    );
}
