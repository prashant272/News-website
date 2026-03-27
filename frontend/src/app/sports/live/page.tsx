"use client";

import React, { useState, useEffect } from 'react';
import styles from './LiveScorePage.module.scss';
import { Trophy, Calendar, MapPin, Activity, X, Clock } from 'lucide-react';
import CricketScorecard from '@/app/Components/T20-world-cup/Scorecard/Scorecard';
import CricketPointsTable from '@/app/Components/T20-world-cup/PointsTable/PointsTable';
import { motion, AnimatePresence } from 'framer-motion';

const LiveScorePage = () => {
    const [matchData, setMatchData] = useState<any>({ live: [], upcoming: [], recent: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent'>('live');
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [activeSeriesId, setActiveSeriesId] = useState<string>("");

    // Filtering State
    const [filterTeam, setFilterTeam] = useState("");
    const [filterVenue, setFilterVenue] = useState("");
    const [filterDate, setFilterDate] = useState("");

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

    // Filtering Logic
    const activeMatches = (matchData[activeTab] || []).filter((match: any) => {
        if (activeTab !== 'upcoming') return true;

        const matchesTeam = !filterTeam || match.name.toLowerCase().includes(filterTeam.toLowerCase());
        const matchesVenue = !filterVenue || match.venue.toLowerCase().includes(filterVenue.toLowerCase());
        const matchesDate = !filterDate || (match.date && match.date.includes(filterDate));

        return matchesTeam && matchesVenue && matchesDate;
    });

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Fetching Live Match Data...</p>
            </div>
        );
    }

    const formatTimeOnly = (match: any) => {
        if (match.dateTimeGMT) {
            return new Date(match.dateTimeGMT).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
        return match.startTime || "TBA";
    };

    const getTeamInitials = (name: string) => {
        if (!name) return "";
        const words = name.split(" ");
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const formatDateLabel = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
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

            {/* Filter Section (Only for Upcoming) */}
            {activeTab === 'upcoming' && (
                <div className={styles.filterSection}>
                    <div className={styles.filterGroup}>
                        <label>Filter by Team</label>
                        <input 
                            type="text" 
                            placeholder="Search team..." 
                            value={filterTeam}
                            onChange={(e) => setFilterTeam(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Filter by Location</label>
                        <input 
                            type="text" 
                            placeholder="Search venue..." 
                            value={filterVenue}
                            onChange={(e) => setFilterVenue(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Filter by Date</label>
                        <input 
                            type="date" 
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {activeMatches.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={styles.noMatch}
                    >
                        <Activity size={48} />
                        <p>No matches found matching your criteria.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        layout
                        className={styles.matchGrid}
                    >
                        {activeMatches.map((match: any, index: number) => {
                            const teams = match.teams || (match.name ? match.name.split(' vs ') : ["Team A", "Team B"]);
                            const team1 = teams[0];
                            const team2 = teams[1];

                            return (
                                <motion.div 
                                    key={match.id} 
                                    layout
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        duration: 0.4, 
                                        delay: index * 0.05,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className={`${styles.matchCard} ${activeTab === 'live' ? styles.liveCard : ''}`}
                                >
                                    <div className={styles.matchHeader}>
                                        <div className={styles.matchType}>{match.matchType?.toUpperCase() || 'T20'}</div>
                                        <div className={`${styles.matchStatus} ${activeTab === 'live' ? styles.statusLive : ''}`}>
                                            {activeTab === 'live' && <Activity size={10} className={styles.liveIcon} />}
                                            {activeTab === 'live' ? 'LIVE' : match.status}
                                        </div>
                                    </div>

                                    <div className={styles.teamsStack}>
                                        <div className={styles.vsDivider}></div>
                                        
                                        {/* Team 1 */}
                                        <div className={styles.teamRow}>
                                            <div className={styles.teamMain}>
                                                <div className={styles.teamInitial}>{getTeamInitials(team1)}</div>
                                                <span className={styles.teamName}>{team1}</span>
                                            </div>
                                            {match.score && match.score[0] && (
                                                <div className={styles.teamScore}>
                                                    <span className={styles.runs}>{match.score[0].r}/{match.score[0].w}</span>
                                                    <span className={styles.overs}>{match.score[0].o} ov</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Team 2 */}
                                        <div className={styles.teamRow}>
                                            <div className={styles.teamMain}>
                                                <div className={styles.teamInitial}>{getTeamInitials(team2)}</div>
                                                <span className={styles.teamName}>{team2}</span>
                                            </div>
                                            {match.score && match.score[1] && (
                                                <div className={styles.teamScore}>
                                                    <span className={styles.runs}>{match.score[1].r}/{match.score[1].w}</span>
                                                    <span className={styles.overs}>{match.score[1].o} ov</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {activeTab === 'upcoming' ? (
                                        <div className={styles.upcomingMeta}>
                                            <div className={styles.time}>{formatTimeOnly(match)}</div>
                                            <div className={styles.dateLabel}>{formatDateLabel(match.date)}</div>
                                        </div>
                                    ) : (
                                        <div className={styles.matchFooter}>
                                            <div className={styles.metaItem}>
                                                <MapPin size={12} />
                                                <span>{match.venue || "TBA"}</span>
                                            </div>
                                            <div className={styles.metaItem}>
                                                <Calendar size={12} />
                                                <span>{formatDateLabel(match.date)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab !== 'upcoming' && (
                                        <button
                                            className={styles.scorecardBtn}
                                            onClick={() => setSelectedMatchId(match.id)}
                                        >
                                            📊 View Full Scorecard
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <div id="standings" className={styles.standingsSection}>
                <CricketPointsTable seriesId={activeSeriesId} />
            </div>
        </div>
    );
};

export default LiveScorePage;
