'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './WebStoryViewer.module.scss';

interface StorySlide {
    image: string;
    title: string;
    description: string;
    link?: string;
}

interface VisualStory {
    _id: string;
    title: string;
    thumbnail: string;
    slides: StorySlide[];
}

interface WebStoryViewerProps {
    story: VisualStory;
    onClose: () => void;
}

export default function WebStoryViewer({ story, onClose }: WebStoryViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const nextSlide = useCallback(() => {
        if (currentIndex < story.slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, story.slides.length, onClose]);

    const prevSlide = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        const duration = 5000; // 5 seconds per slide
        const interval = 50; // Update every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    nextSlide();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex, nextSlide]);

    const currentSlide = story.slides[currentIndex];

    return (
        <div className={styles.overlay}>
            <div className={styles.viewerContainer}>
                {/* Progress Bars */}
                <div className={styles.progressContainer}>
                    {story.slides.map((_, index) => (
                        <div key={index} className={styles.progressBarWrapper}>
                            <div
                                className={styles.progressBarFill}
                                style={{
                                    width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Main Content */}
                <div className={styles.contentArea}>
                    <img src={currentSlide.image} alt={currentSlide.title} className={styles.slideImage} />
                    <div className={styles.textContent}>
                        <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
                        <p className={styles.slideDescription}>{currentSlide.description}</p>
                        {currentSlide.link && (
                            <a href={currentSlide.link} className={styles.readMore}>
                                Read Full Story
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Navigation Zones */}
                <div className={styles.navZones}>
                    <div className={styles.leftZone} onClick={prevSlide}></div>
                    <div className={styles.rightZone} onClick={nextSlide}></div>
                </div>
            </div>
        </div>
    );
}
