"use client";

import React, { useEffect, useState } from 'react';
import styles from './HindiCricketSection.module.scss';
import { cricketService, LiveMatch } from '@/app/services/CricketService';
import Link from 'next/link';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';

const HindiCricketSection: React.FC = () => {
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
                console.error("Cricket Data Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(() => {
            cricketService.getLiveMatches().then(res => {
                if (res.success && res.data) setMatches(res.data);
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const getTeamInitial = (name: string) => {
        if (!name) return "";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // --- Slot Calculation Logic ---
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const tomorrowDate = new Date(today);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    // Priority: find exact date matches, fallback to first available
    const yesterdayMatch = matches.recent.find(m => m.date.startsWith(yesterdayStr)) || matches.recent[0] || null;
    
    const liveMatchToday = matches.live.find(m => m.date.startsWith(todayStr)) || matches.live[0];
    const upcomingToday = matches.upcoming.find(m => m.date.startsWith(todayStr));
    const todayMatch = liveMatchToday || upcomingToday || null;

    const tomorrowMatch = matches.upcoming.find(m => m.date.startsWith(tomorrowStr)) 
        || matches.upcoming.find(m => m.id !== todayMatch?.id && m.id !== yesterdayMatch?.id) 
        || null;

    const slots = [
        { title: 'कल का मैच', match: yesterdayMatch, type: 'past' },
        { title: 'आज का मैच', match: todayMatch, type: 'present' },
        { title: 'कल का मैच', match: tomorrowMatch, type: 'future' }
    ].filter(slot => slot.match !== null);

    if (loading && slots.length === 0) {
        return (
            <div className={styles.cricketContainer}>
                <div className="h-64 animate-pulse bg-gray-100 rounded-2xl w-full" />
            </div>
        );
    }

    if (!loading && slots.length === 0 && !seriesId) {
        return null; // Don't show if no matches and no points table
    }

    return (
        <section className={styles.cricketContainer} id="ipl-2026-section">
            <div className={styles.header}>
                <h2 className={styles.title}>
                    <span className={styles.icon}>🏏</span> 
                    IPL <span className={styles.iplYear}>2026</span> न्यूज़
                </h2>
                <Link href="/news/sports" className={styles.viewAll}>
                    सभी मैच देखें →
                </Link>
            </div>

            {/* THREE-DAY MATCH SLOTS */}
            <div className={styles.matchGrid}>
                {slots.map((slot, index) => {
                    const match = slot.match!;
                    return (
                        <div key={match.id || index} className={`${styles.matchCard} ${slot.type === 'present' ? styles.highlightCard : ''}`}>
                            <div className={styles.slotHeader}>
                                <span className={styles.slotTitle}>{slot.title}</span>
                                <div className={`${styles.badge} ${styles[match.category]}`}>
                                    {match.category === 'live' && <span className={styles.dot} />}
                                    {match.category === 'live' ? 'LIVE' : match.category === 'recent' ? 'Result' : 'Upcoming'}
                                </div>
                            </div>

                            <div className={styles.matchTitle}>
                                {(match.matchType || 'Match').toUpperCase()} • {match.venue || 'TBA'}
                            </div>

                            <div className={styles.teamsContainer}>
                                <div className={styles.teamRow}>
                                    <div className={styles.teamInfo}>
                                        <div className={styles.teamLogo}>{getTeamInitial(match.teams?.[0] || 'T1')}</div>
                                        <span className={styles.teamName}>{match.teams?.[0] || 'Team 1'}</span>
                                    </div>
                                    {match.score?.[0] && (
                                        <span className={styles.score}>{match.score[0].raw || `${match.score[0].r}/${match.score[0].w}`}</span>
                                    )}
                                </div>

                                <div className={styles.teamRow}>
                                    <div className={styles.teamInfo}>
                                        <div className={styles.teamLogo}>{getTeamInitial(match.teams?.[1] || 'T2')}</div>
                                        <span className={styles.teamName}>{match.teams?.[1] || 'Team 2'}</span>
                                    </div>
                                    {match.score?.[1] && (
                                        <span className={styles.score}>{match.score[1].raw || `${match.score[1].r}/${match.score[1].w}`}</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.matchStatus}>
                                {match.category === 'upcoming' ? (
                                    <span className={styles.upcomingTime}>
                                        {mounted && new Date(match.date).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                ) : (
                                    match.status
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* POINTS TABLE */}
            {seriesId && (
                <div className={styles.pointsTableWrapper}>
                    <CricketPointsTable seriesId={seriesId} lang="hi" />
                </div>
            )}
        </section>
    );
};

export default HindiCricketSection;
