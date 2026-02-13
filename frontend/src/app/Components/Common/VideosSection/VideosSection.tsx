"use client"
import React, { useState, useEffect } from 'react';
import styles from './VideosSection.module.scss';
import { Play } from 'lucide-react'; 
import { useActiveAds } from '@/app/hooks/useAds'; 

const categories = [
  'Awards', 'Excellence', 'Leadership', 'Healthcare', 'Education', 
  'Business', 'Innovation', 'Recognition', 'Events', 'Achievements'
];

const videoData = [
  {
    id: '1',
    category: 'Leadership',
    title: "Dr. Preeti Jain | Excellence in Tech Leadership | Prime Time Media",
    videoUrl: 'https://www.youtube.com/watch?v=voKUcapq1Jc',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    tag: 'TECH EXCELLENCE',
    date: 'Jan 23, 2026'
  },
  {
    id: '2',
    category: 'Healthcare',
    title: "Healthcare Excellence Homeopathy of the Year 24-25",
    videoUrl: 'https://www.youtube.com/watch?v=qmrqjt8VfQ0',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    tag: 'HEALTHCARE AWARDS',
    date: 'Jan 22, 2026'
  },
  {
    id: '3',
    category: 'Excellence',
    title: "Fighter Wings | India Excellence Award 2025 | Prime Time Media",
    videoUrl: 'https://www.youtube.com/watch?v=ZXbTIuNz2iQ',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&q=80',
    tag: 'INDIA EXCELLENCE',
    date: 'Jan 23, 2026'
  },
  {
    id: '4',
    category: 'Awards',
    title: "Global Icon Awards 2024 - Celebrating Excellence and Innovation",
    videoUrl: 'https://www.youtube.com/@primetimermedia',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
    tag: 'GLOBAL ICON',
    date: 'Mar 19, 2024'
  },
  {
    id: '5',
    category: 'Education',
    title: "Global Education Excellence Awards - Recognizing Outstanding Institutions",
    videoUrl: 'https://www.youtube.com/@primetimermedia',
    image: 'https://images.unsplash.com/photo-1523050353063-95c55a576307?w=400&q=80',
    tag: 'EDUCATION',
    date: '2025'
  },
  {
    id: '6',
    category: 'Business',
    title: "India Excellence Awards 2025 - Honoring Business Leadership",
    videoUrl: 'https://www.youtube.com/@primetimermedia',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80',
    tag: 'BUSINESS AWARDS',
    date: '2025'
  }
];

export const VideosSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Awards');

  const { data: ads, loading: adsLoading } = useActiveAds();
  const activeAds = (ads || []).filter(ad => ad.isActive);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

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
        <h2 className={styles.mainTitle}>Videos</h2>
        
        <nav className={styles.categoryNav}>
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`${styles.navBtn} ${activeTab === cat ? styles.active : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div className={styles.contentGrid}>
          <div className={styles.videoGrid}>
            {videoData.map((video) => (
              <a 
                key={video.id} 
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoCard}
              >
                <div className={styles.thumbnailContainer}>
                  <img src={video.image} alt={video.title} className={styles.thumbnail} />
                  <div className={styles.overlay}>
                    <div className={styles.playIcon}>
                      <Play fill="white" size={20} />
                    </div>
                    <span className={styles.tag}>{video.tag}</span>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.categoryLabel}>{video.category}</span>
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                </div>
              </a>
            ))}
          </div>

          <div className={styles.adBlock}>
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            
            {adsLoading ? (
              <div className={styles.adImageWrapper} style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#6b7280' }}>
                Loading ad...
              </div>
            ) : activeAds.length > 0 ? (
              <div className={styles.adImageWrapper} style={{ position: 'relative', height: '250px', overflow: 'hidden', borderRadius: '12px' }}>
                {activeAds.map((ad, index) => (
                  <a
                    key={ad._id}
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: index === currentAdIndex ? 1 : 0,
                      transition: 'opacity 0.8s ease-in-out',
                      pointerEvents: index === currentAdIndex ? 'auto' : 'none',
                    }}
                  >
                    <img
                      src={ad.imageUrl}
                      alt={ad.title || 'Advertisement'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {ad.title && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.65)',
                        color: 'white',
                        padding: '10px 12px',
                        fontSize: '13px',
                        textAlign: 'center',
                        fontWeight: 500,
                      }}>
                        {ad.title}
                      </div>
                    )}
                  </a>
                ))}

                {activeAds.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    zIndex: 2,
                  }}>
                    {activeAds.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAdIndex(idx)}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: idx === currentAdIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          border: 'none',
                          cursor: 'pointer',
                          transform: idx === currentAdIndex ? 'scale(1.3)' : 'scale(1)',
                          transition: 'all 0.3s',
                        }}
                        aria-label={`Ad ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.adImageWrapper} style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#6b7280', fontSize: '14px' }}>
                Advertisement space available
              </div>
            )}
          </div>
        </div>

        <div className={styles.footerAction}>
          <a 
            href="https://www.youtube.com/@primetimermedia"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.viewAllBtn}
          >
            View All Videos <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};