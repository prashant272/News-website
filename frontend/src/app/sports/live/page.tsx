"use client";

import React, { useState, useEffect } from 'react';
import styles from './LiveScorePage.module.scss';
import { Trophy, Calendar, MapPin, Activity, X, Clock } from 'lucide-react';
import CricketScorecard from '@/app/Components/T20-world-cup/Scorecard/Scorecard';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';

const LiveScorePage = () => {
    const [matchData, setMatchData] = useState<any>({ live: [], upcoming: [], recent: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent'>('live');
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [activeSeriesId, setActiveSeriesId] = useState<string>("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.primetimemedia.in";

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch settings and initial matches in parallel
                const [settingsRes, matchesRes] = await Promise.all([
                    fetch(`${API_BASE}/api/live/settings`).then(res => res.json()),
                    fetch(`${API_BASE}/api/live/live-matches`).then(res => res.json())
                ]);

                if (settingsRes.success) setActiveSeriesId(settingsRes.data.activeSeriesId);
                if (matchesRes.success) {
                    setMatchData(matchesRes.data || { live: [], upcoming: [], recent: [] });
                }
            } catch (err) {
                console.error("Failed to fetch initial cricket data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        const eventSource = new EventSource(`${API_BASE}/api/live/live-stream`);
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMatchData(data || { live: [], upcoming: [], recent: [] });
            } catch (err) {
                console.error("SSE Error", err);
            }
        };

        return () => eventSource.close();
    }, [API_BASE]);

    const activeMatches = matchData[activeTab] || [];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Fetching Live Match Data...</p>
            </div>
        );
    }

    const formatTime = (match: any) => {
        if (match.dateTimeGMT) {
            return new Date(match.dateTimeGMT).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        if (match.startTime) return match.startTime;
        try {
            return new Date(match.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return '';
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* Scorecard Modal */}
            {selectedMatchId && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMatchId(null)}>
                    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setSelectedMatchId(null)}>
                            <X size={22} />
                        </button>
                        <CricketScorecard matchId={selectedMatchId} />
                    </div>
                </div>
            )}

            <header className={styles.header}>
                <div className={styles.liveBadge}>
                    <span className={styles.pulseDot}></span>
                    LIVE CRICKET
                </div>
                <h1>Real-Time Match Updates</h1>
                <div className={styles.tabContainer}>
                    <button className={`${styles.tab} ${activeTab === 'live' ? styles.active : ''}`} onClick={() => setActiveTab('live')}>
                        Live {matchData.live.length > 0 && <span className={styles.count}>{matchData.live.length}</span>}
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'recent' ? styles.active : ''}`} onClick={() => setActiveTab('recent')}>
                        Recent
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`} onClick={() => setActiveTab('upcoming')}>
                        Upcoming
                    </button>
                    <button className={styles.tab} onClick={() => document.getElementById('standings')?.scrollIntoView({ behavior: 'smooth' })}>
                        Standings
                    </button>
                </div>
            </header>

            {activeMatches.length === 0 ? (
                <div className={styles.noMatch}>
                    <Activity size={48} />
                    <p>No {activeTab} matches found at the moment.</p>
                </div>
            ) : (
                <div className={styles.matchGrid}>
                    {activeMatches.map((match: any) => (
                        <div key={match.id} className={`${styles.matchCard} ${activeTab === 'live' ? styles.liveCard : ''}`}>
                            {/* Card Header */}
                            <div className={styles.matchHeader}>
                                <span className={styles.matchType}>{match.matchType?.toUpperCase() || 'T20'}</span>
                                <span className={`${styles.matchStatus} ${activeTab === 'live' ? styles.statusLive : ''}`}>
                                    {activeTab === 'live' ? '🔴 LIVE' : match.status}
                                </span>
                            </div>

                            {/* Match Name */}
                            <h2 className={styles.matchName}>{match.name}</h2>

                            {/* Score Section */}
                            <div className={styles.scoreSection}>
                                {match.score && match.score.length > 0 ? (
                                    match.score.map((s: any, idx: number) => (
                                        <div key={idx} className={styles.inning}>
                                            <span className={styles.teamName}>{s.inning}</span>
                                            <span className={styles.runScore}>
                                                {s.r}/{s.w} <small>({s.o} ov)</small>
                                            </span>
                                        </div>
                                    ))
                                ) : activeTab === 'upcoming' ? (
                                    <div className={styles.upcomingMeta}>
                                        <Clock size={15} />
                                        <span>
                                            {formatTime(match)}
                                            {match.date && ` • ${new Date(match.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                        </span>
                                    </div>
                                ) : (
                                    <div className={styles.waiting}>Details pending...</div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className={styles.matchFooter}>
                                {match.venue && (
                                    <div className={styles.metaItem}>
                                        <MapPin size={13} />
                                        <span>{match.venue}</span>
                                    </div>
                                )}
                                <div className={styles.metaItem}>
                                    <Calendar size={13} />
                                    <span>{new Date(match.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Scorecard Button — ONLY this triggers the modal */}
                            {activeTab !== 'upcoming' && (
                                <button
                                    className={styles.scorecardBtn}
                                    onClick={() => setSelectedMatchId(match.id)}
                                >
                                    📊 View Full Scorecard
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div id="standings" className={styles.standingsSection}>
                <CricketPointsTable seriesId={activeSeriesId} />
            </div>
        </div>
    );
};

export default LiveScorePage;
