'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../VisualStoriesPage.module.scss'; // Reuse existing styles

interface VisualStory {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category: string;
}

export default function CategoryVisualStoriesListing() {
    const params = useParams();
    const categoryName = params?.category as string;
    const [stories, setStories] = useState<VisualStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
                const res = await fetch(`${base}/api/visual-stories`);
                const data = await res.json();
                if (data.success) {
                    const filtered = data.data.filter((s: any) => {
                        const categories = Array.isArray(s.category) ? s.category : [s.category];
                        return categories.some((cat: string) => cat?.toLowerCase() === categoryName?.toLowerCase());
                    });
                    setStories(filtered);
                }
            } catch (error) {
                console.error('Error fetching visual stories:', error);
            } finally {
                setLoading(false);
            }
        };
        if (categoryName) fetchStories();
    }, [categoryName]);

    if (loading) return <div className={styles.loader}>Loading {categoryName} Stories...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/visualstories" className={styles.backHome}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to All Stories
                </Link>
                <h1 style={{ textTransform: 'capitalize' }}>{categoryName}</h1>
            </div>

            <motion.div 
                className={styles.grid}
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                {stories.map((story) => (
                    <motion.div
                        key={story._id}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                        }}
                    >
                        <Link
                            href={`/visualstories/${(Array.isArray(story.category) ? story.category[0] : (story.category || 'general')).toLowerCase()}/${story.slug}`}
                            className={styles.card}
                        >
                            <div className={styles.imageWrapper}>
                                <img src={story.thumbnail} alt={story.title} loading="lazy" />
                                <span className={styles.badge}>{Array.isArray(story.category) ? story.category[0] : story.category}</span>
                                <div className={styles.overlay}>
                                    <div className={styles.content}>
                                        <h3>{story.title}</h3>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {stories.length === 0 && (
                    <motion.div 
                        className={styles.noData}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p>No stories found in the '{categoryName}' category.</p>
                        <Link href="/visualstories" className={styles.backHome} style={{ display: 'inline-flex', marginTop: '20px' }}>
                            Browse all categories
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
