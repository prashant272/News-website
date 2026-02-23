"use client";
import React, { useState, useEffect, useCallback } from "react";
import { API } from "@/Utils/Utils";
import styles from "./EmployeeReports.module.scss";

interface CategoryStat {
    category: string;
    count: number;
    titles: string[];
}

interface EmployeeStat {
    authorId: string;
    author: string;
    total: number;
    categories: CategoryStat[];
}

const CATEGORY_COLORS: Record<string, string> = {
    india: "#ef4444",
    sports: "#f97316",
    business: "#eab308",
    technology: "#3b82f6",
    entertainment: "#a855f7",
    lifestyle: "#ec4899",
    world: "#06b6d4",
    health: "#22c55e",
    awards: "#f59e0b",
};

const CATEGORY_ICONS: Record<string, string> = {
    india: "🇮🇳",
    sports: "⚽",
    business: "📈",
    technology: "💻",
    entertainment: "🎬",
    lifestyle: "✨",
    world: "🌍",
    health: "🏥",
    awards: "🏆",
};

export default function EmployeeReports() {
    // Get today's date in IST (UTC+5:30)
    const getISTToday = () => {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        return istNow.toISOString().split("T")[0];
    };
    const today = getISTToday();
    const [selectedDate, setSelectedDate] = useState(today);
    const [report, setReport] = useState<EmployeeStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
    const [expandedTitles, setExpandedTitles] = useState<string | null>(null);

    const fetchReport = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.get(`/news/employee-report?date=${date}`);
            if (res.data.success) {
                setReport(res.data.report);
            } else {
                setError("Failed to load report");
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || "Error loading report");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport(selectedDate);
    }, [selectedDate, fetchReport]);

    const totalPublished = report.reduce((sum, emp) => sum + emp.total, 0);

    const allCategoryTotals: Record<string, number> = {};
    report.forEach((emp) => {
        emp.categories.forEach((cat) => {
            allCategoryTotals[cat.category] = (allCategoryTotals[cat.category] || 0) + cat.count;
        });
    });

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>👥 Employee Daily Reports</h2>
                    <p>Track how many news articles each employee published per day</p>
                </div>
                <div className={styles.headerRight}>
                    <input
                        type="date"
                        value={selectedDate}
                        max={today}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={styles.datePicker}
                    />
                    <button onClick={() => fetchReport(selectedDate)} className={styles.refreshBtn}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <p className={styles.dateLabel}>📅 Showing report for: <strong>{formatDate(selectedDate)}</strong></p>

            {/* Summary Cards */}
            <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryNumber}>{report.length}</span>
                    <span className={styles.summaryLabel}>Active Employees</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryNumber}>{totalPublished}</span>
                    <span className={styles.summaryLabel}>Total Published</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryNumber}>{Object.keys(allCategoryTotals).length}</span>
                    <span className={styles.summaryLabel}>Categories Covered</span>
                </div>
            </div>

            {/* Category Totals Bar */}
            {Object.keys(allCategoryTotals).length > 0 && (
                <div className={styles.categoryBar}>
                    <h3>📊 Category Summary</h3>
                    <div className={styles.categoryChips}>
                        {Object.entries(allCategoryTotals)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cat, count]) => (
                                <div
                                    key={cat}
                                    className={styles.categoryChip}
                                    style={{ borderColor: CATEGORY_COLORS[cat] || "#999" }}
                                >
                                    <span>{CATEGORY_ICONS[cat] || "📰"}</span>
                                    <span className={styles.catName}>{cat}</span>
                                    <span
                                        className={styles.catCount}
                                        style={{ background: CATEGORY_COLORS[cat] || "#999" }}
                                    >
                                        {count}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Loading / Error */}
            {loading && <div className={styles.loading}>⏳ Loading report...</div>}
            {error && <div className={styles.error}>❌ {error}</div>}

            {/* No Data */}
            {!loading && !error && report.length === 0 && (
                <div className={styles.empty}>
                    <span>📭</span>
                    <p>No news was published on this date.</p>
                </div>
            )}

            {/* Employee Table */}
            {!loading && report.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee</th>
                                {Object.keys(allCategoryTotals)
                                    .sort()
                                    .map((cat) => (
                                        <th key={cat}>
                                            {CATEGORY_ICONS[cat] || "📰"} {cat}
                                        </th>
                                    ))}
                                <th>Total</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map((emp, idx) => {
                                const catMap: Record<string, CategoryStat> = {};
                                emp.categories.forEach((c) => (catMap[c.category] = c));
                                const isExpanded = expandedEmployee === emp.author;

                                return (
                                    <React.Fragment key={emp.author}>
                                        <tr className={idx % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                            <td className={styles.rank}>
                                                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                                            </td>
                                            <td className={styles.employeeName}>
                                                <div className={styles.avatar}>
                                                    {emp.author?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                                {emp.author}
                                            </td>
                                            {Object.keys(allCategoryTotals)
                                                .sort()
                                                .map((cat) => (
                                                    <td
                                                        key={cat}
                                                        className={styles.countCell}
                                                        style={catMap[cat] ? { color: CATEGORY_COLORS[cat] || "#333", fontWeight: 700 } : {}}
                                                    >
                                                        {catMap[cat] ? catMap[cat].count : "-"}
                                                    </td>
                                                ))}
                                            <td className={styles.totalCell}>{emp.total}</td>
                                            <td>
                                                <button
                                                    className={styles.expandBtn}
                                                    onClick={() => setExpandedEmployee(isExpanded ? null : emp.author)}
                                                >
                                                    {isExpanded ? "▲ Hide" : "▼ Show"}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded article titles */}
                                        {isExpanded && (
                                            <tr className={styles.expandedRow}>
                                                <td colSpan={Object.keys(allCategoryTotals).length + 4}>
                                                    <div className={styles.titlesGrid}>
                                                        {emp.categories.map((cat) => (
                                                            <div key={cat.category} className={styles.titleCategory}>
                                                                <h4 style={{ color: CATEGORY_COLORS[cat.category] || "#333" }}>
                                                                    {CATEGORY_ICONS[cat.category] || "📰"} {cat.category} ({cat.count})
                                                                </h4>
                                                                <ul>
                                                                    {cat.titles.map((title, ti) => (
                                                                        <li key={ti}>{title}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                        {/* Total row */}
                        <tfoot>
                            <tr className={styles.totalRow}>
                                <td colSpan={2}><strong>📊 Total</strong></td>
                                {Object.keys(allCategoryTotals)
                                    .sort()
                                    .map((cat) => (
                                        <td key={cat} className={styles.totalCell}>
                                            <strong>{allCategoryTotals[cat] || 0}</strong>
                                        </td>
                                    ))}
                                <td className={styles.totalCell}><strong>{totalPublished}</strong></td>
                                <td />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
}
