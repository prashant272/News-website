"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useNewsSectionData, StoryItem } from '@/app/hooks/useNewsSectionData';
import styles from './MoreStories.module.scss';

interface MoreStoriesSectionProps {
  title?: string;
  limit?: number;
  excludeSlug?: string;
  overrideSection?: string;
}

export default function MoreStoriesSection({
  title = 'MORE STORIES',
  limit = 3,
  excludeSlug,
  overrideSection,
}: MoreStoriesSectionProps) {
  const { items, isLoading } = useNewsSectionData<StoryItem>({
    variant: 'stories',
    overrideSection,
    limit,
    excludeSlug,
  });

  if (isLoading || items.length === 0) {
    return (
      <section className={styles.moreStoriesSection}>
        <div className={styles.containerInner}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}></div>
            <h2 className={styles.mainTitle}>{title}</h2>
            <div className={styles.titleLine}></div>
          </div>
          <div className={styles.storiesGrid}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className={styles.storyCard} style={{ opacity: 0.5 }}>
                <div className={styles.imageWrapper} style={{ background: '#e5e7eb' }}>
                  <div className="animate-pulse bg-gray-300 h-full w-full"></div>
                </div>
                <div className={styles.contentWrapper}>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.moreStoriesSection}>
      <div className={styles.containerInner}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleIcon}></div>
          <h2 className={styles.mainTitle}>{title}</h2>
          <div className={styles.titleLine}></div>
        </div>

        <div className={styles.storiesGrid}>
          {items.map((story, index) => (
            <Link
              key={story.id}
              href={story.href}
              className={styles.storyCard}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  className={styles.storyImage}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className={styles.imageOverlay}></div>
              </div>

              <div className={styles.contentWrapper}>
                <div className={styles.categoryWrapper}>
                  <div className={styles.categoryDot}></div>
                  <p className={styles.category}>{story.category}</p>
                </div>

                <h3 className={styles.storyTitle}>{story.title}</h3>

                <div className={styles.metaInfo}>
                  <div className={styles.timeWrapper}>
                    <svg className={styles.clockIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className={styles.timeAgo}>{story.timeAgo}</span>
                  </div>

                  <div className={styles.authorWrapper}>
                    <svg className={styles.authorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className={styles.author}>{story.author}</span>
                  </div>
                </div>
              </div>

              <div className={styles.hoverArrow}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}