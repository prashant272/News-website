'use client';
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useNewsContext } from '@/app/context/NewsContext';
import styles from './MoreStories.module.scss';

interface Story {
  id: string | number;
  image: string;
  category: string;
  title: string;
  timeAgo?: string;
  author?: string;
  slug: string;
  section?: string;
  date?: string;
}

interface MoreStoriesSectionProps {
  stories?: Story[];
  title?: string;
  limit?: number;
  excludeSlug?: string;
}

function calculateTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return '1 day ago';
  }
}

const MoreStoriesSection: React.FC<MoreStoriesSectionProps> = ({ 
  stories, 
  title = 'MORE STORIES',
  limit = 3,
  excludeSlug
}) => {
  const pathname = usePathname();
  const { allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews } = useNewsContext();

  const section = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    const pagesIndex = parts.indexOf('Pages');

    if (pagesIndex !== -1 && parts[pagesIndex + 1]) {
      const candidate = parts[pagesIndex + 1];
      if (['india', 'sports', 'business', 'entertainment', 'lifestyle'].includes(candidate)) {
        return candidate;
      }
    }

    return 'all';
  }, [pathname]);

  const sectionData = useMemo(() => {
    switch (section) {
      case 'india':        return indiaNews || [];
      case 'sports':       return sportsNews || [];
      case 'business':     return businessNews || [];
      case 'entertainment': return entertainmentNews || [];
      case 'lifestyle':    return lifestyleNews || [];
      default:             return allNews || [];
    }
  }, [section, allNews, indiaNews, sportsNews, businessNews, entertainmentNews, lifestyleNews]);

  const contextStories = useMemo(() => {
    if (!sectionData || sectionData.length === 0) return [];

    let filtered = [...sectionData];

    if (excludeSlug) {
      filtered = filtered.filter(item => item.slug !== excludeSlug);
    }

    return filtered
      .slice(0, limit)
      .map((item: any) => ({
        id: item._id || item.id || `story-${item.slug}`,
        image: item.image || '/images/default-news.jpg',
        category: item.category || section.toUpperCase(),
        title: item.title || 'Untitled',
        timeAgo: item.date ? calculateTimeAgo(item.date) : '1 day ago',
        author: item.author || 'News Desk',
        slug: item.slug || '',
        section: item.section || section
      }));
  }, [sectionData, section, limit, excludeSlug]);

  const displayStories = contextStories;

  if (displayStories.length === 0) {
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
          {displayStories.map((story, index) => {
            const href = story.slug
              ? `/Pages/${story.section || section}/${story.slug}`
              : '#';

            return (
              <Link
                key={story.id}
                href={href}
                className={styles.storyCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={story.image.startsWith('http') || story.image.startsWith('/') 
                      ? story.image 
                      : `/public/${story.image}`}
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
                      <svg
                        className={styles.clockIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 7v5l3 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={styles.timeAgo}>{story.timeAgo || '1 day ago'}</span>
                    </div>

                    <div className={styles.authorWrapper}>
                      <svg
                        className={styles.authorIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      <span className={styles.author}>{story.author || 'News Desk'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.hoverArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MoreStoriesSection;

export type { Story };
