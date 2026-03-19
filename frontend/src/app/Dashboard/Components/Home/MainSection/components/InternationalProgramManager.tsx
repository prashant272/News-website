"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Power, PowerOff, Globe } from "lucide-react";
import { toast } from "react-toastify";
import styles from "../Main.module.scss";

interface ProgramItem {
    _id: string;
    title: string;
    link: string;
    isActive: boolean;
    createdAt: string;
}

const InternationalProgramManager: React.FC = () => {
    const [programs, setPrograms] = useState<ProgramItem[]>([]);
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8086";

    const fetchPrograms = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/international-programs?all=true`);
            if (response.data.success) {
                setPrograms(response.data.data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to fetch international programs");
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !link.trim()) return toast.warning("Title and link are required");

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/api/international-programs`, {
                title: title.trim(),
                link: link.trim()
            });

            if (response.data.success) {
                toast.success("International program added");
                setTitle("");
                setLink("");
                fetchPrograms();
            }
        } catch (error) {
            console.error("Add Error:", error);
            toast.error("Failed to add program");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        // Optimistic UI Update
        const previousPrograms = [...programs];
        setPrograms(programs.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));

        try {
            const response = await axios.put(`${API_BASE}/api/international-programs/${id}`, {
                isActive: !currentStatus
            });
            if (response.data.success) {
                toast.success(`Program ${!currentStatus ? 'activated' : 'deactivated'}`);
                // No need to fetch all, just sync with server response data if needed
            } else {
                setPrograms(previousPrograms);
                toast.error("Failed to update status");
            }
        } catch (error) {
            setPrograms(previousPrograms);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this program?")) return;

        // Optimistic UI Update
        const previousPrograms = [...programs];
        setPrograms(programs.filter(p => p._id !== id));

        try {
            const response = await axios.delete(`${API_BASE}/api/international-programs/${id}`);
            if (response.data.success) {
                toast.success("Deleted successfully");
            } else {
                setPrograms(previousPrograms);
                toast.error("Failed to delete");
            }
        } catch (error) {
            setPrograms(previousPrograms);
            toast.error("Failed to delete");
        }
    };

    return (
        <div className={styles.articlesSection}>
            <div className={styles.articlesSectionHeader}>
                <h2 className={styles.sectionTitle}><Globe className="mr-2" style={{ display: 'inline' }} /> International Program Manager</h2>
                <p className={styles.headerSubtitle}>Manage links in the Awards dropdown</p>
            </div>

            <div className={styles.editor}>
                <form onSubmit={handleAdd} className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Program Title <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Global Healthcare Summit 2026"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Target Link (URL) <span className={styles.required}>*</span></label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="https://..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.primaryBtn} disabled={loading}>
                            <Plus size={18} /> {loading ? "Adding..." : "Add International Program"}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles.articlesSection}>
                <div className={styles.articlesSectionHeader}>
                    <h3 className={styles.sectionTitle}>Existing Programs ({programs.length})</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Link</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>No programs found</td>
                                </tr>
                            ) : (
                                programs.map((item) => (
                                    <tr key={item._id}>
                                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</td>
                                        <td>
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                {item.link}
                                            </a>
                                        </td>
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

export default InternationalProgramManager;
