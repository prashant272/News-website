"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './AwardsPopup.module.scss';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNewsSectionData } from '@/app/hooks/useNewsSectionData';
import { useNewsContext } from '@/app/context/NewsContext';
import Image from 'next/image';
import logo from "@/assets/Logo/logo.png";

const SHOW_INTERVAL_MS = 2 * 60 * 1000;
const FIRST_SHOW_DELAY_MS = 300; // Decreased delay for faster popup appearance

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
    const { items: allAwards } = useNewsSectionData({
        variant: 'grid',
        overrideSection: 'awards',
        limit: 15
    });
    const { selectedAward, closeAwardPopup } = useNewsContext();

    // Filter awards that are marked for popup rotation
    const liveAwards = allAwards?.filter(item => item.showInPopup === true) || [];

    const [visible, setVisible] = useState(false);
    const [awardIndex, setAwardIndex] = useState(0);
    const indexRef = useRef(0);
    const timerRef = useRef<any>(null);
    const intervalRef = useRef<any>(null);

    const isAdmin = pathname?.startsWith('/Dashboard');

    // Handle auto-show logic (only if NOT on admin and NO specific award is selected)
    useEffect(() => {
        if (isAdmin || selectedAward) return;

        timerRef.current = setTimeout(() => {
            const currentCount = (liveAwards && liveAwards.length > 0) ? liveAwards.length : FALLBACK_AWARDS.length;
            const startingIndex = Math.floor(Math.random() * currentCount);
            setAwardIndex(startingIndex);
            indexRef.current = startingIndex;
            setVisible(true);

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
    }, [isAdmin, selectedAward, liveAwards.length]);

    // If an award is selected manually, show the popup
    const isPopupOpen = visible || !!selectedAward;

    if (!isPopupOpen) return null;

    const handleClose = () => {
        setVisible(false);
        closeAwardPopup();
    };

    let nominateUrl: string;
    let articleUrl: string;
    let titleText: string;
    let descText: string;
    let imageUrl: string | undefined;
    let totalCount = 0;
    let currentPos = 0;

    if (selectedAward) {
        // Specific Award View
        articleUrl = (selectedAward as any).moreInfoLink || (selectedAward as any).targetLink || `/Pages/${selectedAward.category}/${selectedAward.subCategory}/${selectedAward.slug}`;
        nominateUrl = (selectedAward as any).nominationLink || articleUrl;
        titleText = selectedAward.title;
        descText = selectedAward.summary || "Recognizing excellence and leadership in India.";
        imageUrl = selectedAward.image;
    } else {
        // Auto-rotation View
        const hasLiveAwards = liveAwards && liveAwards.length > 0;
        totalCount = hasLiveAwards ? liveAwards.length : FALLBACK_AWARDS.length;
        currentPos = awardIndex % totalCount;

        if (hasLiveAwards) {
            const item = liveAwards[currentPos];
            articleUrl = item.targetLink || item.href;
            nominateUrl = item.nominationLink || articleUrl;
            titleText = item.title;
            descText = "Recognizing excellence and leadership in India.";
            imageUrl = item.image;
        } else {
            const fb = FALLBACK_AWARDS[currentPos];
            nominateUrl = fb.nominateUrl;
            articleUrl = fb.articleUrl;
            titleText = fb.title;
            descText = fb.subtitle;
            imageUrl = undefined;
        }
    }

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                    <X size={20} />
                </button>

                <div className={styles.contentArea}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={titleText} className={styles.popupImage} />
                    ) : (
                        <div className={styles.fallbackCard}>
                            <Image src={logo} alt="PrimeTime" className={styles.fallbackLogo} width={120} height={120} />
                            <h3 className={styles.fallbackTitle}>{titleText}</h3>
                            <p className={styles.fallbackDesc}>{descText}</p>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <a href={nominateUrl} target="_blank" rel="noopener noreferrer"
                        className={styles.nominateBtn} onClick={handleClose}>
                        🏆 Nominate Now
                    </a>
                    <a href={articleUrl} target="_blank" rel="noopener noreferrer"
                        className={styles.infoBtn} onClick={handleClose}>
                        More Info
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AwardsPopup;
