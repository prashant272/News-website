"use client"
import React, { useState } from 'react';
import styles from './VideosSection.module.scss';
import { Play } from 'lucide-react'; 

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

  return (
    <section className={styles.videoSection}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>Videos</h2>
        
        {/* Category Navigation */}
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

        {/* Grid Layout */}
        <div className={styles.contentGrid}>
          {/* Video Cards */}
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
                    <div className={styles.playIcon}><Play fill="white" size={20} /></div>
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

          {/* Advertisement Block */}
          <div className={styles.adBlock}>
            <span className={styles.adLabel}>ADVERTISEMENT</span>
            <div className={styles.adImageWrapper}>
              <img src="/swadeshi-ad.jpg" alt="Swadeshi Way Ad" />
            </div>
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
