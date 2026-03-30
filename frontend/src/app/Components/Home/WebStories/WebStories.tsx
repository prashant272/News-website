'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './WebStories.module.scss';
import viewerStyles from './WebStoryViewer.module.scss';

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
    slides: StorySlide[];
    category: string;
}

// ─── Inline Story Viewer ────────────────────────────────────────────────────
function WebStoryViewer({
    story,
    allStories,
    onClose,
    onSelectStory,
}: {
    story: VisualStory;
    allStories: VisualStory[];
    onClose: () => void;
    onSelectStory: (s: VisualStory) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showEndScreen, setShowEndScreen] = useState(false);

    // Reset when story changes
    useEffect(() => {
        setCurrentIndex(0);
        setProgress(0);
        setShowEndScreen(false);
    }, [story._id]);

    const showEnd = useCallback(() => {
        setShowEndScreen(true);
    }, []);

    const nextSlide = useCallback(() => {
        if (currentIndex < story.slides.length - 1) {
            setCurrentIndex(i => i + 1);
            setProgress(0);
        } else {
            showEnd();
        }
    }, [currentIndex, story.slides.length, showEnd]);

    const prevSlide = useCallback(() => {
        if (showEndScreen) {
            // Go back to last slide from end screen
            setShowEndScreen(false);
            setProgress(0);
        } else if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setProgress(0);
        }
    }, [currentIndex, showEndScreen]);

    // Keyboard navigation for desktop
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [nextSlide, prevSlide, onClose]);

    useEffect(() => {
        if (showEndScreen) return; // Pause timer on end screen
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
    }, [currentIndex, nextSlide, showEndScreen]);

    const currentSlide = story.slides[currentIndex];
    const otherStories = allStories.filter(s => s._id !== story._id);

    return (
        <div className={viewerStyles.overlay}>
            <div className={viewerStyles.viewerContainer}>
                {/* Progress Bars */}
                <div className={viewerStyles.progressContainer}>
                    {story.slides.map((_, index) => (
                        <div key={index} className={viewerStyles.progressBarWrapper}>
                            <div
                                className={viewerStyles.progressBarFill}
                                style={{
                                    width: index < currentIndex ? '100%'
                                        : index === currentIndex && !showEndScreen ? `${progress}%`
                                            : index < story.slides.length && showEndScreen ? '100%'
                                                : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button className={viewerStyles.closeBtn} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* End Screen */}
                {showEndScreen ? (
                    <div className={viewerStyles.endScreen}>
                        <div className={viewerStyles.endScreenBg}>
                            <img src={story.thumbnail} alt="" className={viewerStyles.endBgImg} />
                            <div className={viewerStyles.endBgOverlay} />
                        </div>
                        <div className={viewerStyles.endContent}>
                            <h3 className={viewerStyles.endTitle}>Check This Too</h3>
                            <div className={viewerStyles.endGrid}>
                                {otherStories.slice(0, 4).map(s => (
                                    <div
                                        key={s._id}
                                        className={viewerStyles.endCard}
                                        onClick={() => onSelectStory(s)}
                                    >
                                        <img src={s.thumbnail} alt={s.title} className={viewerStyles.endCardImg} />
                                        <div className={viewerStyles.endCardOverlay} />
                                        <p className={viewerStyles.endCardTitle}>{s.title}</p>
                                    </div>
                                ))}
                            </div>
                            <button className={viewerStyles.replayBtn} onClick={() => { setCurrentIndex(0); setProgress(0); setShowEndScreen(false); }}>
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
                        {/* Main Slide Content */}
                        <div className={viewerStyles.contentArea}>
                            <div className={viewerStyles.imageWrapper}>
                                {currentSlide?.source && (
                                    <div className={viewerStyles.imageSource}>
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        {currentSlide.source}
                                    </div>
                                )}
                                <img src={currentSlide?.image} alt="" className={viewerStyles.blurBg} aria-hidden="true" />
                                <img src={currentSlide?.image} alt={currentSlide?.title} className={viewerStyles.mainImg} />
                            </div>

                            <div className={viewerStyles.textContent}>
                                <h2 className={viewerStyles.slideTitle}>{currentSlide?.title}</h2>
                                <p className={viewerStyles.slideDescription}>{currentSlide?.description}</p>
                                {currentSlide?.link && (
                                    <a href={currentSlide.link} className={viewerStyles.readMore}>
                                        Read Full Story
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Tap zones for mobile */}
                        <div className={viewerStyles.navZones}>
                            <div className={viewerStyles.leftZone} onClick={prevSlide} />
                            <div className={viewerStyles.rightZone} onClick={nextSlide} />
                        </div>

                        {/* Visible arrow buttons */}
                        {currentIndex > 0 && (
                            <button className={`${viewerStyles.arrowBtn} ${viewerStyles.arrowLeft}`} onClick={prevSlide} aria-label="Previous slide">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                        )}
                        <button className={`${viewerStyles.arrowBtn} ${viewerStyles.arrowRight}`} onClick={nextSlide} aria-label="Next slide">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Main WebStories Carousel ────────────────────────────────────────────────
export default function WebStories() {
    const [stories, setStories] = useState<VisualStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<VisualStory | null>(null);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when story is open
    useEffect(() => {
        if (selectedStory) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [selectedStory]);

    useEffect(() => {
        const fetchStories = async () => {
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
            try {
                const res = await fetch(`${base}/api/visual-stories`);
                const data = await res.json();
                if (data.success) {
                    setStories(data.data);
                } else {
                    console.warn('API returned success:false for visual stories:', data);
                }
            } catch (error) {
                console.error('CRITICAL: Error fetching visual stories from base:', base, error);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (loading || stories.length === 0) return null;

    return (
        <section className={styles.webStoriesSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <span className={styles.redDot} />
                        Visual Stories
                    </h2>
                    <div className={styles.navButtons}>
                        <button onClick={() => scroll('left')} className={styles.navBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <button onClick={() => scroll('right')} className={styles.navBtn}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={styles.carouselWrapper}>
                    <div className={styles.scrollArea} ref={scrollRef}>
                        {stories.map(story => (
                            <div
                                key={story._id}
                                className={styles.storyCard}
                                onClick={() => setSelectedStory(story)}
                            >
                                <div className={styles.imageWrapper}>
                                    <img src={story.thumbnail} alt="" className={styles.blurBgImg} aria-hidden="true" />
                                    <img src={story.thumbnail} alt={story.title} className={styles.mainThumbnail} />
                                    <div className={styles.overlay} />
                                </div>
                                <div className={styles.content}>
                                    <h3 className={styles.storyTitle}>{story.title}</h3>
                                </div>
                                <div className={styles.categoryBadge}>{story.category}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedStory && (
                    <WebStoryViewer
                        story={selectedStory}
                        allStories={stories}
                        onClose={() => setSelectedStory(null)}
                        onSelectStory={(s) => setSelectedStory(s)}
                    />
                )}
            </div>
        </section>
    );
}
