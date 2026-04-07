"use client";

import React, { useEffect, useState } from 'react';
import styles from './HindiCricketSection.module.scss';
import { cricketService, LiveMatch } from '@/app/services/CricketService';
import Link from 'next/link';
import Image from 'next/image';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';
import { useNewsBySection } from '@/app/hooks/NewsApi';
import { useLanguage } from '@/app/hooks/useLanguage';
import { formatDateTime } from '@/Utils/Utils';
import { getLocalizedHref } from '@/Utils/navigation';

const HindiCricketSection: React.FC = () => {
    const { lang } = useLanguage();
    const { data: cricketNews, loading: newsLoading } = useNewsBySection('cricket', false, 1, 4, "published", lang);
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
        { title: 'आगामी मैच', match: tomorrowMatch, type: 'future' }
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
                <Link href="/news/match-center" className={styles.viewAll}>
                    सभी मैच देखें →
                </Link>
            </div>

            {/* 4-COLUMN BALANCED DASHBOARD */}
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
                                    <span className={styles.score}>
                                        {match.score?.[0] ? (match.score[0].raw || `${match.score[0].r || 0}/${match.score[0].w || 0}`) : '0/0'}
                                    </span>
                                </div>

                                <div className={styles.teamRow}>
                                    <div className={styles.teamInfo}>
                                        <div className={styles.teamLogo}>{getTeamInitial(match.teams?.[1] || 'T2')}</div>
                                        <span className={styles.teamName}>{match.teams?.[1] || 'Team 2'}</span>
                                    </div>
                                    <span className={styles.score}>
                                        {match.score?.[1] ? (match.score[1].raw || `${match.score[1].r || 0}/${match.score[1].w || 0}`) : '0/0'}
                                    </span>
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

                {/* 4TH SLOT: POINTS TABLE */}
                {seriesId && (
                    <div className={styles.gridPointsTable}>
                        <div className={styles.pointsHeader}>IPL Standings</div>
                        <div className={styles.tableMiniWrapper}>
                            <CricketPointsTable seriesId={seriesId} lang="hi" compact={true} />
                        </div>
                    </div>
                )}
            </div>

            {/* CRICKET NEWS SUB-SECTION */}
            <div className={styles.newsSection}>
                <div className={styles.newsHeader}>
                    <h3>क्रिकेट समाचार</h3>
                    <Link href={getLocalizedHref('/Pages/sports', lang)} className={styles.viewMoreNews}>
                        सभी समाचार देखें
                    </Link>
                </div>
                <div className={styles.newsGrid}>
                    {newsLoading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className={styles.newsItemPlaceholder}>
                                <div className={styles.shimmerImg}></div>
                                <div className={styles.shimmerLine}></div>
                                <div className={styles.shimmerLineShort}></div>
                            </div>
                        ))
                    ) : cricketNews && cricketNews.length > 0 ? (
                        cricketNews.map(item => (
                            <Link 
                                key={item._id} 
                                href={getLocalizedHref(`/Pages/${(Array.isArray(item.category) ? item.category[0] : (item.category || 'sports')).toLowerCase()}/${(item.subCategory || 'general').toLowerCase()}/${item.slug}`, lang)} 
                                className={styles.newsCard}
                            >
                                <div className={styles.newsImage}>
                                    <Image
                                        src={item.image || '/placeholder.jpg'}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 250px"
                                    />
                                </div>
                                <div className={styles.newsContent}>
                                    <h4 className={styles.newsTitle}>{item.title}</h4>
                                    <span className={styles.newsDate}>{formatDateTime((item.publishedAt || item.createdAt || '').toString())}</span>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className={styles.noNews}>कोई क्रिकेट समाचार उपलब्ध नहीं है।</div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HindiCricketSection;
