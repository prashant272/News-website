import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './RecommendedStories.module.scss';

interface Story {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category: string;
}

interface RecommendedStoriesProps {
  stories: Story[];
}

export default function RecommendedStories({ stories }: RecommendedStoriesProps) {
  return (
    <div className={styles.recommendedStories}>
      <h2 className={styles.heading}>RECOMMENDED STORIES</h2>
      <div className={styles.storiesList}>
        {stories.map((story, index) => (
          <Link
            key={story.id}
            href={`/Pages/${story.section || 'india'}/${story.category || 'general'}/${story.slug}`}
            className={styles.storyItem}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={story.image}
                alt={story.title}
                width={80}
                height={60}
                className={styles.image}
              />
              <span className={styles.number}>{index + 1}</span>
            </div>
            <h3 className={styles.title}>{story.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
