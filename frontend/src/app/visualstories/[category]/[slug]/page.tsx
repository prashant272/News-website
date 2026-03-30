'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './VisualStoryPage.module.scss';

interface StorySlide {
    image: string;
    title: string;
    description: string;
    link?: string;
    source?: string;
}

interface VisualStory {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category: string;
    slides: StorySlide[];
}

export default function VisualStoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const category = params?.category as string;

    const [story, setStory] = useState<VisualStory | null>(null);
    const [allStories, setAllStories] = useState<VisualStory[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showEndScreen, setShowEndScreen] = useState(false);
    const [loading, setLoading] = useState(true);

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [storyRes, allRes] = await Promise.all([
                    fetch(`${base}/api/visual-stories/slug/${slug}`),
                    fetch(`${base}/api/visual-stories`)
                ]);
                const storyData = await storyRes.json();
                const allData = await allRes.json();
                if (storyData.success) setStory(storyData.data);
                if (allData.success) setAllStories(allData.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    // Reset slide index when story changes
    useEffect(() => {
        setCurrentIndex(0);
        setProgress(0);
        setShowEndScreen(false);
    }, [story?._id]);

    const nextSlide = useCallback(() => {
        if (!story) return;
        if (currentIndex < story.slides.length - 1) {
            setCurrentIndex(i => i + 1);
            setProgress(0);
        } else {
            setShowEndScreen(true);
        }
    }, [currentIndex, story]);

    const prevSlide = useCallback(() => {
        if (showEndScreen) {
            setShowEndScreen(false);
            setProgress(0);
        } else if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setProgress(0);
        }
    }, [currentIndex, showEndScreen]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') router.back();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [nextSlide, prevSlide, router]);

    // Auto-advance timer
    useEffect(() => {
        if (showEndScreen || !story) return;
        setProgress(0);
        const duration = 5000;
        const intervalMs = 50;
        const step = (intervalMs / duration) * 100;
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= 100) {
                clearInterval(timer);
                nextSlide();
            } else {
                setProgress(current);
            }
        }, intervalMs);

        return () => clearInterval(timer);
    }, [currentIndex, nextSlide, showEndScreen, story]);

    const goToStory = (s: VisualStory) => {
        router.push(`/visualstories/${s.category}/${s.slug}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!story) {
        return (
            <div className={styles.notFound}>
                <h1>Story not found</h1>
                <Link href="/">← Back to Home</Link>
            </div>
        );
    }

    const currentSlide = story.slides[currentIndex];
    const otherStories = allStories.filter(s => s._id !== story._id);

    return (
        <div className={styles.pageWrapper}>
            {/* Back button */}
            <button className={styles.backBtn} onClick={() => router.back()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
            </button>

            <div className={styles.viewerContainer}>
                {/* Progress Bars */}
                <div className={styles.progressContainer}>
                    {story.slides.map((_, index) => (
                        <div key={index} className={styles.progressBarWrapper}>
                            <div
                                className={styles.progressBarFill}
                                style={{
                                    width: index < currentIndex ? '100%'
                                        : index === currentIndex && !showEndScreen ? `${progress}%`
                                        : showEndScreen ? '100%'
                                        : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Story Title Header */}
                <div className={styles.storyHeader}>
                    <span className={styles.storyHeaderTitle}>{story.title}</span>
                </div>

                {/* End Screen */}
                {showEndScreen ? (
                    <div className={styles.endScreen}>
                        <div className={styles.endBg}>
                            <img src={story.thumbnail} alt="" className={styles.endBgImg} />
                            <div className={styles.endBgOverlay} />
                        </div>
                        <div className={styles.endContent}>
                            <h3 className={styles.endTitle}>Check This Too</h3>
                            <div className={styles.endGrid}>
                                {otherStories.slice(0, 4).map(s => (
                                    <div key={s._id} className={styles.endCard} onClick={() => goToStory(s)}>
                                        <img src={s.thumbnail} alt={s.title} className={styles.endCardImg} />
                                        <div className={styles.endCardOverlay} />
                                        <p className={styles.endCardTitle}>{s.title}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={styles.replayBtn}
                                onClick={() => { setCurrentIndex(0); setProgress(0); setShowEndScreen(false); }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                </svg>
                                Replay
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Slide Image with Dual-Layer Zero-Crop & Quality Optimization */}
                        <div className={styles.slideImage}>
                            {currentSlide?.source && (
                                <div className={styles.imageSource}>
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '5px' }}>
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    {currentSlide.source}
                                </div>
                            )}
                            <AnimatePresence mode="popLayout">
                                <div key={currentIndex} className={styles.imageLayerWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}>
                                    {/* Layer 1: Blurred Background */}
                                    <motion.img
                                        src={currentSlide?.image}
                                        alt=""
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1 }}
                                        className={styles.blurBg}
                                        aria-hidden="true"
                                    />
                                    {/* Layer 2: Sharp Main Image (Uncropped) */}
                                    <motion.img
                                        src={currentSlide?.image}
                                        alt={currentSlide?.title}
                                        initial={{ opacity: 0, scale: 1 }}
                                        animate={{ opacity: 1, scale: 1.05 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ 
                                            opacity: { duration: 1.5, ease: "easeOut" },
                                            scale: { duration: 6, ease: "linear" } 
                                        }}
                                        className={styles.storyImg}
                                    />
                                </div>
                            </AnimatePresence>
                            <div className={styles.slideGradient} />
                        </div>

                        {/* Slide Text with Entrance Animation */}
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentIndex}
                                className={styles.slideText}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            >
                                <h2 className={styles.slideTitle}>{currentSlide?.title}</h2>
                                <p className={styles.slideDesc}>{currentSlide?.description}</p>
                                {currentSlide?.link && (
                                    <a href={currentSlide.link} className={styles.readMore}>
                                        Read Full Story →
                                    </a>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Tap zones */}
                        <div className={styles.tapZones}>
                            <div className={styles.tapLeft} onClick={prevSlide} />
                            <div className={styles.tapRight} onClick={nextSlide} />
                        </div>

                        {/* Arrow buttons */}
                        {currentIndex > 0 && (
                            <button className={`${styles.arrowBtn} ${styles.arrowLeft}`} onClick={prevSlide}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        )}
                        <button className={`${styles.arrowBtn} ${styles.arrowRight}`} onClick={nextSlide}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
