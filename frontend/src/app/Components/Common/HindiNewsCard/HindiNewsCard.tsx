"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocalizedHref } from '@/Utils/navigation';
import { formatDateTime } from '@/Utils/Utils';
import styles from './HindiNewsCard.module.scss';

interface HindiNewsCardProps {
    item: any;
    lang?: string;
    showCategory?: boolean;
    compact?: boolean;
    orientation?: 'vertical' | 'horizontal';
}

const HindiNewsCard: React.FC<HindiNewsCardProps> = ({
    item,
    lang = 'hi',
    showCategory = true,
    compact = false,
    orientation = 'vertical'
}) => {
    if (!item) return null;

    const categoryRaw = Array.isArray(item.category) ? item.category[0] : (item.category || 'news');
    const category = categoryRaw.toLowerCase();
    const subCategory = (item.subCategory || 'general').toLowerCase().trim();
    const href = getLocalizedHref(`/Pages/${category}/${subCategory}/${item.slug}`, lang);

    const cardClasses = [
        styles.hindiCard,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        compact ? styles.compact : ''
    ].join(' ');

    const isAwardCategory = category === "awards" || (item.category && item.category[0]?.toLowerCase() === "awards");

    const handleCardClick = () => {
        if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div onClick={handleCardClick} className={cardClasses} style={{ cursor: 'pointer' }}>
            <div className={styles.imageWrapper}>
                <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.title}
                    fill
                    sizes={orientation === 'horizontal' ? "120px" : "(max-width: 768px) 100vw, 400px"}
                    className={styles.image}
                />

                {item.isLive && (
                    <div className={styles.liveBadge}>
                        <span className={styles.liveDot}></span>
                        {lang === 'hi' ? 'लाइव' : 'LIVE'}
                    </div>
                )}
            </div>

            <div className={styles.content}>
                {showCategory && (
                    <div className={styles.meta}>
                        <span className={styles.categoryName}>
                            {item.subCategory || category}
                        </span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.date}>
                            {formatDateTime(item.publishedAt || item.createdAt || Date.now())}
                        </span>
                    </div>
                )}

                <h3 className={styles.title}>{item.title}</h3>

                {isAwardCategory && (item.nominationLink || item.moreInfoLink) && (
                    <div className={styles.awardActions}>
                        {item.nominationLink && (
                            <a 
                                href={item.nominationLink.startsWith('http') ? item.nominationLink : `https://${item.nominationLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.nominateBtn}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Nominate Now
                            </a>
                        )}
                        {item.moreInfoLink && (
                            <a 
                                href={item.moreInfoLink.startsWith('http') ? item.moreInfoLink : `https://${item.moreInfoLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.moreInfoBtn}
                                onClick={(e) => e.stopPropagation()}
                            >
                                More Info
                            </a>
                        )}
                    </div>
                )}

                {!compact && orientation === 'vertical' && (
                    <div className={styles.footer}>
                        <span className={styles.readMore}>
                            {lang === 'hi' ? 'पूरी खबर पढ़ें' : 'Read More'}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HindiNewsCard;
