"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './AwardsPopup.module.scss';
import { X, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNewsContext } from '@/app/context/NewsContext';

const SHOW_INTERVAL_MS = 2 * 60 * 1000;
const FIRST_SHOW_DELAY_MS = 1000;

// Fallback data shown if no awards in DB
const FALLBACK_AWARDS = [
    {
        _id: 'f1',
        title: "Global Healthcare Excellence Awards, 2026 & Summit",
        subtitle: "Recognizing outstanding achievements in India's healthcare sector.",
        badge: "🏥 Healthcare",
        nominateUrl: "https://healthcareawards.primetimemedia.in/nominate",
        articleUrl: "https://healthcareawards.primetimemedia.in/",
    },
    {
        _id: 'f2',
        title: "Global Education Excellence Awards, 2026 & Summit",
        subtitle: "Celebrating visionaries shaping the future of education in India.",
        badge: "🎓 Education",
        nominateUrl: "https://education-awards.primetimemedia.in/nominate",
        articleUrl: "https://education-awards.primetimemedia.in/",
    },
    {
        _id: 'f3',
        title: "UK Busnieiness Leadership Awards, 2026 & Summit",
        subtitle: "Honoring India's most influential business leaders of the year.",
        badge: "💼 Business",
        nominateUrl: "https://business-leadership.primetimemedia.in/nominate",
        articleUrl: "https://business-leadership.primetimemedia.in/",
    },
];

const AwardsPopup: React.FC = () => {
    const pathname = usePathname();
    const { awardsNews } = useNewsContext();
    const [visible, setVisible] = useState(false);
    const [awardIndex, setAwardIndex] = useState(0);
    const indexRef = useRef(0);
    const timerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    const isAdmin = pathname?.startsWith('/Dashboard');

    useEffect(() => {
        if (isAdmin) return;

        // Show first popup
        timerRef.current = setTimeout(() => {
            setAwardIndex(0);
            indexRef.current = 0;
            setVisible(true);

            // Then cycle every 2 mins
            intervalRef.current = setInterval(() => {
                indexRef.current = indexRef.current + 1;
                setAwardIndex(indexRef.current);
                setVisible(true);
            }, SHOW_INTERVAL_MS);
        }, FIRST_SHOW_DELAY_MS);

        return () => {
            clearTimeout(timerRef.current);
            clearInterval(intervalRef.current);
        };
        // Only run once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    if (isAdmin || !visible) return null;

    // Build awards list — use live data if available, else fallback
    const liveAwards = (awardsNews && awardsNews.length > 0) ? awardsNews : null;

    let award: any;
    let nominateUrl: string;
    let articleUrl: string;
    let badgeLabel: string;
    let titleText: string;
    let descText: string;

    if (liveAwards) {
        const idx = awardIndex % liveAwards.length;
        const item = liveAwards[idx] as any;
        articleUrl = item.targetLink
            ? (item.targetLink.startsWith('http') ? item.targetLink : `https://${item.targetLink}`)
            : `https://www.primetimemedia.in/Pages/awards/${item.category}/${item.slug}`;
        nominateUrl = item.nominationLink
            ? (item.nominationLink.startsWith('http') ? item.nominationLink : `https://${item.nominationLink}`)
            : articleUrl;
        badgeLabel = `🏆 ${item.subCategory || item.category || 'Awards'}`;
        titleText = item.title;
        descText = item.subtitle || "Recognizing excellence and leadership in India.";
    } else {
        const idx = awardIndex % FALLBACK_AWARDS.length;
        const fb = FALLBACK_AWARDS[idx];
        nominateUrl = fb.nominateUrl;
        articleUrl = fb.articleUrl;
        badgeLabel = fb.badge;
        titleText = fb.title;
        descText = fb.subtitle;
    }

    const totalCount = liveAwards ? liveAwards.length : FALLBACK_AWARDS.length;
    const currentPos = awardIndex % totalCount;

    return (
        <div className={styles.overlay} onClick={() => setVisible(false)}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>

                <button className={styles.closeBtn} onClick={() => setVisible(false)} aria-label="Close">
                    <X size={18} />
                </button>

                <span className={styles.badge}>{badgeLabel}</span>
                <h2 className={styles.title}>{titleText}</h2>
                <p className={styles.desc}>{descText}</p>

                <div className={styles.actions}>
                    <a href={nominateUrl} target="_blank" rel="noopener noreferrer"
                        className={styles.nominateBtn} onClick={() => setVisible(false)}>
                        🏆 Nominate Now
                    </a>
                    <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                        className={styles.infoBtn} onClick={() => setVisible(false)}>
                        <ExternalLink size={14} /> More Info
                    </a>
                </div>

                <div className={styles.dots}>
                    {Array.from({ length: Math.min(totalCount, 8) }).map((_, i) => (
                        <span key={i} className={`${styles.dot} ${i === currentPos % Math.min(totalCount, 8) ? styles.activeDot : ''}`} />
                    ))}
                </div>
                <p className={styles.counter}>{currentPos + 1} of {totalCount}</p>
            </div>
        </div>
    );
};

export default AwardsPopup;
