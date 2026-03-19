'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './VisualStoriesPage.module.scss';

interface VisualStory {
    _id: string;
    title: string;
    slug: string;
    thumbnail: string;
    category: string;
}

export default function VisualStoriesListing() {
    const [stories, setStories] = useState<VisualStory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
                const res = await fetch(`${base}/api/visual-stories`);
                const data = await res.json();
                if (data.success) {
                    setStories(data.data);
                }
            } catch (error) {
                console.error('Error fetching visual stories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    if (loading) return <div className={styles.loader}>Loading Stories...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/" className={styles.backHome}>← Home</Link>
                <h1>All Visual Stories</h1>
            </div>

            <div className={styles.grid}>
                {stories.map(story => (
                    <Link
                        key={story._id}
                        href={`/visualstories/${story.category || 'general'}/${story.slug}`}
                        className={styles.card}
                    >
                        <div className={styles.imageWrapper}>
                            <img src={story.thumbnail} alt={story.title} />
                            <span className={styles.badge}>{story.category}</span>
                        </div>
                        <div className={styles.content}>
                            <h3>{story.title}</h3>
                        </div>
                    </Link>
                ) )}
            </div>
            {stories.length === 0 && <p className={styles.noData}>No stories found.</p>}
        </div>
    );
}
