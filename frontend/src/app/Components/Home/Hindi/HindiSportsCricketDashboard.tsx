"use client";

import React, { useEffect, useState, useMemo } from 'react';
import styles from './HindiSportsCricketDashboard.module.scss';
import { cricketService, LiveMatch } from '@/app/services/CricketService';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';

type TabType = 'points' | 'today' | 'upcoming' | 'past';

const HindiSportsCricketDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('today');
    const [matches, setMatches] = useState<{
        live: LiveMatch[],
        recent: LiveMatch[],
        upcoming: LiveMatch[]
    }>({ live: [], recent: [], upcoming: [] });

    const [seriesId, setSeriesId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            try {
                const [matchesRes, settingsRes] = await Promise.all([
                    cricketService.getLiveMatches(),
                    cricketService.getSettings()
                ]);

                if (matchesRes.success && matchesRes.data) {
                    setMatches(matchesRes.data);
                }

                if (settingsRes.success && settingsRes.data?.activeSeriesId) {
                    setSeriesId(settingsRes.data.activeSeriesId);
                }
            } catch (error) {
                console.error("Match Center Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const getTeamInitial = (name: string) => {
        if (!name) return "";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const tabData = useMemo(() => {
        const todayMatches = [
            ...matches.live,
            ...matches.upcoming.filter(m => m.date.startsWith(todayStr))
        ];

        const upcomingMatches = matches.upcoming.filter(m => !m.date.startsWith(todayStr));
        const pastMatches = matches.recent;

        return {
            today: todayMatches,
            upcoming: upcomingMatches,
            past: pastMatches
        };
    }, [matches, todayStr]);

    const renderMatchCard = (match: LiveMatch) => (
        <div key={match.id} className={styles.matchCard}>
            <div className={styles.cardHeader}>
                <div className={`${styles.badge} ${styles[match.category]}`}>
                    {match.category === 'live' && <span className={styles.dot} />}
                    {match.category === 'live' ? 'LIVE' : match.category === 'recent' ? 'Result' : 'Upcoming'}
                </div>
                <span className={styles.matchType}>
                    {(match.matchType || 'Match').toUpperCase()}
                </span>
            </div>

            <div className={styles.teams}>
                {[0, 1].map(idx => (
                    <div key={idx} className={styles.teamRow}>
                        <div className={styles.teamInfo}>
                            <div className={styles.teamLogo}>{getTeamInitial(match.teams?.[idx] || 'T')}</div>
                            <span className={styles.teamName}>{match.teams?.[idx] || `Team ${idx + 1}`}</span>
                        </div>
                        <span className={styles.score}>
                            {match.score?.[idx] ? (match.score[idx].raw || `${match.score[idx].r || 0}/${match.score[idx].w || 0}`) : '0/0'}
                        </span>
                    </div>
                ))}
            </div>

            <div className={styles.cardFooter}>
                {match.category === 'upcoming' ? (
                    <span className={styles.time}>
                        {mounted && new Date(match.date).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                ) : (
                    <span className={styles.status}>{match.status}</span>
                )}
                <span className={styles.venue}>{match.venue}</span>
            </div>
        </div>
    );

    if (loading && !seriesId && matches.live.length === 0) return <div className={styles.loading}>लोड हो रहा है...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.tabHeader}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'points' ? styles.active : ''}`}
                    onClick={() => setActiveTab('points')}
                >
                    पॉइंट्स टेबल
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'today' ? styles.active : ''}`}
                    onClick={() => setActiveTab('today')}
                >
                    आज का मैच
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'upcoming' ? styles.active : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    आगामी मैच
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'past' ? styles.active : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    बीता हुआ मैच
                </button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'points' && seriesId && (
                    <div className={styles.pointsWrapper}>
                        <CricketPointsTable seriesId={seriesId} lang="hi" />
                    </div>
                )}

                {activeTab !== 'points' && (
                    <div className={styles.matchGrid}>
                        {tabData[activeTab as keyof typeof tabData].length > 0 ? (
                            tabData[activeTab as keyof typeof tabData].map(renderMatchCard)
                        ) : (
                            <div className={styles.noData}>फिलहाल कोई डेटा उपलब्ध नहीं है।</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HindiSportsCricketDashboard;
