"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Power, PowerOff, ListPlus } from "lucide-react";
import { toast } from "react-toastify";
import styles from "../Main.module.scss";

interface BreakingNewsItem {
    _id: string;
    title: string;
    link?: string;
    isActive: boolean;
    createdAt: string;
}

const BreakingNewsManager: React.FC = () => {
    const [news, setNews] = useState<BreakingNewsItem[]>([]);
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8086";

    const fetchNews = async () => {
        try {
            const response = await axios.get(`${API_BASE}/breaking-news?all=true`);
            if (response.data.success) {
                setNews(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to fetch breaking news");
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.warning("Title is required");

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/breaking-news`, {
                title: title.trim(),
                link: link.trim() || null
            });

            if (response.data.success) {
                toast.success("Breaking news added");
                setTitle("");
                setLink("");
                fetchNews();
            }
        } catch (error) {
            console.error("Add Error:", error);
            toast.error("Failed to add breaking news");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            const response = await axios.put(`${API_BASE}/breaking-news/${id}`, {
                isActive: !currentStatus
            });
            if (response.data.success) {
                toast.success(`News ${!currentStatus ? 'activated' : 'deactivated'}`);
                fetchNews();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this news?")) return;

        try {
            const response = await axios.delete(`${API_BASE}/breaking-news/${id}`);
            if (response.data.success) {
                toast.success("Deleted successfully");
                fetchNews();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className={styles.articlesSection}>
            <div className={styles.articlesSectionHeader}>
                <h2 className={styles.sectionTitle}><ListPlus className="mr-2" style={{ display: 'inline' }} /> Breaking News Manager</h2>
                <p className={styles.headerSubtitle}>Live ticker updates on your homepage</p>
            </div>

            <div className={styles.editor}>
                <form onSubmit={handleAdd} className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Headline Title <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. India marks a historic win against Australia..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Target Link (Optional)</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="https://..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                            <Plus size={18} /> {loading ? "Adding..." : "Add Breaking News"}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.articlesSection}>
                <div className={styles.articlesSectionHeader}>
                    <h3 className={styles.sectionTitle}>Existing Headlines ({news.length})</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Headline</th>
                                <th>Created At</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No breaking news headlines found</td>
                                </tr>
                            ) : (
                                news.map((item) => (
                                    <tr key={item._id}>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</div>
                                            {item.link && <small style={{ color: 'var(--primary)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.link}</small>}
                                        </td>
                                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${item.isActive ? styles.published : styles.draft}`}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    onClick={() => handleToggle(item._id, item.isActive)}
                                                    className={item.isActive ? styles.viewBtnActive : styles.viewBtn}
                                                    title={item.isActive ? "Deactivate" : "Activate"}
                                                    style={{ padding: '8px' }}
                                                >
                                                    {item.isActive ? <Power size={16} /> : <PowerOff size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className={styles.secondaryBtn}
                                                    title="Delete"
                                                    style={{ padding: '8px', color: '#ef4444' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BreakingNewsManager;

