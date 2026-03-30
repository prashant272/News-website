"use client"
import React, { useState, useEffect } from 'react';
import styles from './VideosSection.module.scss';
import { Play, ArrowRight } from 'lucide-react'; 
import { useActiveAds } from '@/app/hooks/useAds'; 
import { WebStoryViewer, VisualStory } from '../../Home/WebStories/WebStories';
import { motion, AnimatePresence } from 'framer-motion';


export const VideosSection: React.FC = () => {
    const [stories, setStories] = useState<VisualStory[]>([]);
    const [selectedStory, setSelectedStory] = useState<VisualStory | null>(null);
    const [loading, setLoading] = useState(true);

    const { data: ads, loading: adsLoading } = useActiveAds();
    const activeAds = (ads || []).filter(ad => ad.isActive);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        const fetchAwards = async () => {
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086';
            try {
                const res = await fetch(`${base}/api/visual-stories`);
                const data = await res.json();
                if (data.success) {
                    const awards = data.data.filter((s: any) => s.category?.toLowerCase() === 'awards');
                    setStories(awards);
                }
            } catch (error) {
                console.error('Error fetching awards stories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAwards();
    }, []);

    useEffect(() => {
        if (activeAds.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [activeAds.length]);

    return (
        <section className={styles.videoSection}>
            <div className={styles.container}>
                <motion.h2 
                    className={styles.mainTitle}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    Awards & Showreels
                </motion.h2>
                
                <div className={styles.contentGrid}>
                    <motion.div 
                        className={styles.videoGrid}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {loading ? (
                            <div className={styles.loader}>Loading Award Stories...</div>
                        ) : stories.length > 0 ? (
                            stories.map((story, index) => (
                                <motion.div 
                                    key={story._id} 
                                    className={styles.videoCard}
                                    onClick={() => setSelectedStory(story)}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.thumbnailContainer}>
                                        <img src={story.thumbnail} alt={story.title} className={styles.thumbnail} />
                                        
                                        <div className={styles.overlay}>
                                            <span className={styles.categoryLabel}>Recognition</span>
                                            <h3 className={styles.videoTitle}>{story.title}</h3>
                                        </div>

                                        <div className={styles.playIcon}>
                                            <Play size={24} />
                                        </div>
                                        <span className={styles.tag}>{story.category}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className={styles.noData}>No award stories available yet.</div>
                        )}
                    </motion.div>

                    <aside className={styles.adBlock}>
                        <span className={styles.adLabel}>PREMIUM PARTNER</span>
                        {adsLoading ? (
                            <div className={styles.adWrapper}>
                                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    Loading Ads...
                                </div>
                            </div>
                        ) : activeAds.length > 0 ? (
                            <div className={styles.adWrapper}>
                                <a
                                    href={activeAds[currentAdIndex].link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={activeAds[currentAdIndex].imageUrl}
                                        alt="Ad"
                                        className={styles.adImage}
                                    />
                                </a>
                            </div>
                        ) : (
                            <div className={styles.adWrapper}>
                                <div style={{ padding: '40px', textAlign: 'center', color: '#ccc' }}>
                                    <small>ADVERTISEMENT</small>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>

                <div className={styles.footerAction}>
                    <a href="/visualstories/awards" className={styles.viewAllBtn}>
                        View All Awards <ArrowRight size={20} />
                    </a>
                </div>
            </div>

            <AnimatePresence>
                {selectedStory && (
                    <WebStoryViewer
                        story={selectedStory}
                        allStories={stories}
                        onClose={() => setSelectedStory(null)}
                        onSelectStory={(story: VisualStory) => setSelectedStory(story)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};