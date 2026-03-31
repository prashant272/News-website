'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import styles from './VisualStoryPage.module.scss';

// Quality Optimizer: Injects high-fidelity parameters into Cloudinary URLs
const optimizeImageUrl = (url: string) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    if (url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/q_auto:best,f_auto,c_limit,w_1200/');
    }
    return url;
};

interface StorySlide {
    image: string;
    videoUrl?: string;
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

    const [story, setStory] = useState<VisualStory | null>(null);
    const [allStories, setAllStories] = useState<VisualStory[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showEndScreen, setShowEndScreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recsLoading, setRecsLoading] = useState(false);

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial Fetch: Priority on story data
    useEffect(() => {
        const fetchStory = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${base}/api/visual-stories/slug/${slug}`);
                const data = await res.json();
                if (data.success) {
                    setStory(data.data);
                }
            } catch (err) {
                console.error("Error fetching story:", err);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchStory();
    }, [slug, base]);

    // Lazy load recommendations ONLY on end screen
    useEffect(() => {
        if (showEndScreen && allStories.length === 0 && !recsLoading) {
            const fetchRecs = async () => {
                setRecsLoading(true);
                try {
                    const res = await fetch(`${base}/api/visual-stories`);
                    const data = await res.json();
                    if (data.success) {
                        setAllStories(data.data.filter((s: any) => s.slug !== slug));
                    }
                } catch (err) {
                    console.error("Error fetching recommendations:", err);
                } finally {
                    setRecsLoading(false);
                }
            };
            fetchRecs();
        }
    }, [showEndScreen, allStories.length, recsLoading, base, slug]);

    // Preload next slide images
    useEffect(() => {
        if (story && currentIndex < story.slides.length - 1) {
            const nextImg = new window.Image();
            nextImg.src = optimizeImageUrl(story.slides[currentIndex + 1].image);
        }
    }, [currentIndex, story]);

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

    // Auto-advance timer
    useEffect(() => {
        if (showEndScreen || !story) return;
        if (timerRef.current) clearInterval(timerRef.current);
        
        setProgress(0);
        const duration = story.slides[currentIndex]?.videoUrl ? 10000 : 5000;
        const intervalMs = 50;
        const step = (intervalMs / duration) * 100;
        let current = 0;

        timerRef.current = setInterval(() => {
            current += step;
            if (current >= 100) {
                nextSlide();
            } else {
                setProgress(current);
            }
        }, intervalMs);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentIndex, nextSlide, showEndScreen, story]);

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.premiumSpinner} />
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
            <button className={styles.backBtn} onClick={() => router.back()} title="Back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
            </button>

            <div className={styles.viewerContainer}>
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

                <div className={styles.storyHeader}>
                    <span className={styles.storyHeaderTitle}>{story.title}</span>
                </div>

                {showEndScreen ? (
                    <div className={styles.endScreen}>
                        <div className={styles.endBg}>
                            <img src={optimizeImageUrl(story.thumbnail)} alt="" className={styles.endBgImg} />
                            <div className={styles.endBgOverlay} />
                        </div>
                        <div className={styles.endContent}>
                            <h3 className={styles.endTitle}>Discover More</h3>
                            <div className={styles.endGrid}>
                                {recsLoading ? (
                                    <div className={styles.recsLoading}>Loading Stories...</div>
                                ) : (
                                    otherStories.slice(0, 4).map(s => (
                                        <div key={s._id} className={styles.endCard} onClick={() => router.push(`/visualstories/${s.category}/${s.slug}`)}>
                                            <img src={optimizeImageUrl(s.thumbnail)} alt={s.title} className={styles.endCardImg} />
                                            <div className={styles.endCardOverlay} />
                                            <p className={styles.endCardTitle}>{s.title}</p>
                                        </div>
                                    ))
                                )}
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
                        <div className={styles.slideImage}>
                            {currentSlide?.source && (
                                <div className={styles.imageSource}>{currentSlide.source}</div>
                            )}
                            <AnimatePresence mode="popLayout">
                                {currentSlide?.videoUrl ? (
                                    <div className={styles.videoLayer}>
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeID(currentSlide.videoUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeID(currentSlide.videoUrl)}&enablejsapi=1&rel=0&start=1`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                ) : (
                                    <div key={currentIndex} className={styles.imageLayerWrapper}>
                                        <img
                                            src={optimizeImageUrl(currentSlide?.image)}
                                            alt=""
                                            className={styles.blurBg}
                                            aria-hidden="true"
                                        />
                                        <motion.img
                                            src={optimizeImageUrl(currentSlide?.image)}
                                            alt={currentSlide?.title}
                                            initial={{ opacity: 0, scale: 1 }}
                                            animate={{ opacity: 1, scale: 1.05 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ 
                                                opacity: { duration: 1.5 },
                                                scale: { duration: 12, ease: "linear" } 
                                            }}
                                            className={styles.storyImg}
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                            <div className={styles.slideGradient} />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentIndex}
                                className={styles.slideText}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className={styles.slideTitle}>{currentSlide?.title}</h2>
                                <p className={styles.slideDesc}>{currentSlide?.description}</p>
                                {currentSlide?.link && (
                                    <a href={currentSlide.link} target="_blank" rel="noopener noreferrer" className={styles.readMore}>
                                        Read More →
                                    </a>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className={styles.tapZones}>
                            <div className={styles.tapLeft} onClick={prevSlide} />
                            <div className={styles.tapRight} onClick={nextSlide} />
                        </div>

                        <button className={`${styles.arrowBtn} ${styles.arrowLeft}`} onClick={prevSlide}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button className={`${styles.arrowBtn} ${styles.arrowRight}`} onClick={nextSlide}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

function getYouTubeID(url: string) {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
}
