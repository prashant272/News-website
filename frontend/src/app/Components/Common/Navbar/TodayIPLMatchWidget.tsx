"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { cricketService, LiveMatch } from '@/app/services/CricketService';
import styles from './TodayIPLMatchWidget.module.scss';
import Image from 'next/image';

const TodayIPLMatchWidget: React.FC = () => {
    const [headerMatch, setHeaderMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchMatch = async () => {
            try {
                const res = await cricketService.getSettings();
                if (!isMounted) return;

                if (res.success && res.data?.headerMatch?.isActive) {
                    setHeaderMatch(res.data.headerMatch);
                } else {
                    setHeaderMatch(null);
                }
            } catch (error) {
                console.error("Match Widget fetch error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMatch();
        const interval = setInterval(fetchMatch, 60000); // 1-minute poll
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (loading || !headerMatch) {
        return null; // Return nothing if not active or loading
    }

    const { team1Name, team1Img, team2Name, team2Img } = headerMatch;

    const t1Src = team1Img || 'https://ui-avatars.com/api/?name=' + (team1Name?.[0] || 'A') + '&background=e31e26&color=fff';
    const t2Src = team2Img || 'https://ui-avatars.com/api/?name=' + (team2Name?.[0] || 'B') + '&background=1a1a1a&color=fff';

    return (
        <Link href="/sports/cricket" className={styles.widgetWrapper}>
            <div className={styles.bgSplit}></div>
            <div className={styles.widgetContainer}>
                <div className={styles.badge}>TODAY MATCH</div>
                <div className={styles.competitors}>
                    <div className={styles.teamGrp}>
                        <div className={styles.captainPhoto}>
                            <img src={t1Src} alt={team1Name || 'Team 1'} />
                        </div>
                        <span className={styles.teamNameText}>{team1Name || 'T1'}</span>
                    </div>

                    <div className={styles.vsContainer}>
                        <span className={styles.vsText}>VS</span>
                    </div>

                    <div className={styles.teamGrp}>
                        <div className={styles.captainPhoto}>
                            <img src={t2Src} alt={team2Name || 'Team 2'} />
                        </div>
                        <span className={styles.teamNameText}>{team2Name || 'T2'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TodayIPLMatchWidget;
