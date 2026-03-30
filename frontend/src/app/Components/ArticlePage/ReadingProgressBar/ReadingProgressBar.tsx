'use client';

import React, { useState, useEffect } from 'react';
import styles from './ReadingProgressBar.module.scss';

export default function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener('scroll', updateScrollCompletion);

    return () => {
      window.removeEventListener('scroll', updateScrollCompletion);
    };
  }, []);

  return (
    <div className={styles.progressBarWrapper}>
      <div 
        className={styles.progressBar} 
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
