"use client";
import React, { useState, useEffect, useCallback, FC } from "react";
import { API } from "@/Utils/Utils";
import styles from "../Main.module.scss";

interface AnalyticsDashboardProps {
    isSuperAdmin: boolean;
}

const AnalyticsDashboard: FC<AnalyticsDashboardProps> = ({ isSuperAdmin }) => {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        if (!isSuperAdmin) return;
        setLoading(true);
        try {
            const res = await API.get(`/news/analytics`);
            if (res.data.success) {
                setAnalyticsData(res.data.data);
            }
        } catch (err) {
            console.error("Fetch analytics error:", err);
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (!isSuperAdmin) return null;

    return (
        <div className={styles.analyticsSection}>
            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Loading analytics...</p>
                </div>
            ) : (
                <>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <span className={styles.statIcon}>📈</span>
                            <div className={styles.statInfo}>
                                <span className={styles.statLabel}>Total Articles</span>
                                <span className={styles.statValue}>{analyticsData?.totalNews || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.analyticsGrid}>
                        <div className={styles.analyticsCard}>
                            <h3 className={styles.cardTitle}>Articles by Category</h3>
                            <div className={styles.chartList}>
                                {Object.entries(analyticsData?.analyticsByCategory || {}).map(([cat, count]: any) => (
                                    <div key={cat} className={styles.chartItem}>
                                        <span className={styles.chartLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                        <div className={styles.chartBarContainer}>
                                            <div
                                                className={styles.chartBar}
                                                style={{ width: `${((count as number) / (analyticsData?.totalNews || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <span className={styles.chartCount}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.analyticsCard}>
                            <h3 className={styles.cardTitle}>Contributor Performance</h3>
                            <div className={styles.chartList}>
                                {Object.entries(analyticsData?.analyticsByAuthor || {}).map(([author, count]: any) => (
                                    <div key={author} className={styles.chartItem}>
                                        <span className={styles.chartLabel}>{author}</span>
                                        <div className={styles.chartBarContainer}>
                                            <div
                                                className={styles.chartBar}
                                                style={{ width: `${((count as number) / (analyticsData?.totalNews || 1)) * 100}%`, backgroundColor: '#4f46e5' }}
                                            />
                                        </div>
                                        <span className={styles.chartCount}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
