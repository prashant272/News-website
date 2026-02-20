"use client";
import React, { useState, useEffect, useCallback } from "react";
import { API } from "@/Utils/Utils";
import { NewsItem } from "@/app/hooks/NewsApi";
import styles from "./AINewsManagement.module.scss";

interface AIDraft extends NewsItem {
    category: string;
}

interface AINewsManagementProps {
    onEdit: (item: NewsItem) => void;
}

export default function AINewsManagement({ onEdit }: AINewsManagementProps) {
    const [drafts, setDrafts] = useState<AIDraft[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchDrafts();
    }, [fetchDrafts]);

    const handlePublish = async (item: AIDraft) => {
        if (!confirm(`Are you sure you want to publish "${item.title}"?`)) return;
        try {
            // Update status to published
            await API.put(`/news/${item.category}/${item.slug}`, {
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

    if (loading) return <div className={styles.loading}>Loading AI Drafts...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>🤖 AI Generated Drafts ({drafts.length})</h2>
                <button onClick={fetchDrafts} className={styles.refreshBtn}>Refresh</button>
            </div>

            <div className={styles.grid}>
                {drafts.map((draft, index) => (
                    <div key={`${draft.slug}-${index}`} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <span className={styles.badge}>{draft.category}</span>
                            <span className={styles.badgeSource}>{draft.source || "AI"}</span>
                        </div>
                        <h3>{draft.title}</h3>
                        <p>{draft.content.substring(0, 100)}...</p>
                        <div className={styles.cardActions}>
                            <button onClick={() => onEdit(draft)}>Edit In Form</button>
                            <button className={styles.publishBtn} onClick={() => handlePublish(draft)}>Publish</button>
                        </div>
                    </div>
                ))}
                {drafts.length === 0 && <p>No AI drafts found. Trigger the fetcher!</p>}
            </div>
        </div>
    );
}
