'use client';

import React, { useState, useEffect } from 'react';
import styles from './SidebarAds.module.scss';
import { useActiveAds } from '@/app/hooks/useAds';

interface SidebarAdsProps {
    count?: number;
}

const SidebarAds: React.FC<SidebarAdsProps> = ({ count = 5 }) => {
    const { data: ads, loading: adsLoading } = useActiveAds();
    const sidebarAds = (ads || []).filter(ad => ad.isActive && (ad.sidebarImageUrl || ad.placement === 'sidebar'));

    const [adIndices, setAdIndices] = useState<number[]>(Array(count).fill(0).map((_, i) => i));

    useEffect(() => {
        if (sidebarAds.length <= 1) return;

        const interval = setInterval(() => {
            setAdIndices(prev => prev.map(idx => (idx + 1) % sidebarAds.length));
        }, 5000 + Math.random() * 2000); // Slight randomization for natural feel

        return () => clearInterval(interval);
    }, [sidebarAds.length]);

    const renderAd = (containerIndex: number) => {
        if (adsLoading) {
            return (
                <div className={styles.adPlaceholder}>
                    <span>Loading advertisement...</span>
                </div>
            );
        }

        if (sidebarAds.length === 0) {
            return (
                <div className={styles.adPlaceholder}>
                    <div className={styles.emptyAdBox}>
                        <span>AD SPACE</span>
                        <small>Sidebar Ad Position {containerIndex + 1}</small>
                    </div>
                </div>
            );
        }

        const currentAdIndex = adIndices[containerIndex] % sidebarAds.length;
        const currentAd = sidebarAds[currentAdIndex];

        return (
            <div className={styles.adWrapper} key={currentAdIndex}>
                <a
                    href={currentAd.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.adLink}
                >
                    <img
                        src={currentAd.sidebarImageUrl || currentAd.imageUrl}
                        alt={currentAd.title || "Advertisement"}
                        className={styles.adImage}
                        loading="lazy"
                    />
                </a>
            </div>
        );
    };

    return (
        <div className={styles.adSpace}>
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            <div className={styles.sidebarAdsList}>
                {Array.from({ length: count }).map((_, i) => (
                    <React.Fragment key={i}>
                        {renderAd(i)}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default SidebarAds;
