import React from 'react';
import styles from './HeroSection.module.scss';

const HeroSection: React.FC = () => {
  const videoId = 'xJ05rWqlS8w'; 

  return (
    <section className={styles.hero}>
      <div className={styles.videoBackground}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
          title="Hero Background Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={styles.videoIframe}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>Welcome to Our Platform</h1>
          <p className={styles.subtitle}>Discover excellence in awards and services.</p>
          <div className={styles.buttons}>
            <button className={styles.primaryBtn}>Get Started</button>
            <button className={styles.secondaryBtn}>Learn More</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
