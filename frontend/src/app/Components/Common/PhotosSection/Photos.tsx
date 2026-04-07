"use client"
import React, { useState } from 'react';
import styles from './PhotosSection.module.scss';
import { ImageIcon } from 'lucide-react'; 

const categories = ['India', 'Sports', 'Entertainment', 'World', 'Fashion', 'Lifestyle'];

const photoData = [
  {
    id: '1',
    category: 'Lifestyle',
    title: "Things to do in Mumbai today that don't feel touristy",
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=500&q=80',
  },
  {
    id: '2',
    category: 'India',
    title: "Ajit Pawar dies: Here's everything you need to know about plane crash in pics",
    image: 'https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?w=500&q=80',
  },
  {
    id: '3',
    category: 'Lifestyle',
    title: "From ice skating to nature walks: 7 boredom-proof things to do in Gurgaon (Gurugram)",
    image: 'https://images.unsplash.com/photo-1547990158-947754378170?w=500&q=80',
  },
  {
    id: '4',
    category: 'Fashion & Lifestyle',
    title: "Heart Evangelista to Victoria Beckham: The best-dressed stars at Paris Couture Fashion Week 2026",
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80',
  },
  {
    id: '5',
    category: 'India',
    title: "Arjun MBT, Bhairav Battalions and more: India displays its military might on Republic Day | In Pics",
    image: 'https://images.unsplash.com/photo-1532375811409-905115c3b381?w=500&q=80',
  }
];

export const PhotosSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('India');

  return (
    <section className={styles.photoSection}>
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>Photos</h2>
        
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
          <div className={styles.photoGrid}>
            {photoData.map((photo) => (
              <div key={photo.id} className={styles.photoCard}>
                <div className={styles.thumbnailContainer}>
                  <img src={photo.image} alt={photo.title} className={styles.thumbnail} />
                  <div className={styles.overlay}>
                    <div className={styles.galleryIcon}>
                      <ImageIcon size={18} color="white" />
                    </div>
                  </div>
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.categoryLabel}>{photo.category}</span>
                  <h3 className={styles.photoTitle}>{photo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerAction}>
          <button className={styles.viewAllBtn}>View All <span>→</span></button>
        </div>
      </div>
    </section>
  );
};
