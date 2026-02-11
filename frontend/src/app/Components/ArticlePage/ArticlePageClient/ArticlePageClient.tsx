'use client';

import React from 'react';
import styles from './ArticlePageClient.module.scss';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import ArticleHeader from '../ArticleHeader/ArticleHeader';
import ArticleContent from '../ArticleContent/ArticleContent';
import TopNewsSidebar from '../TopNewsSidebar/TopNewsSidebar';
import RecommendedStories from '../RecommendedStories/RecommendedStories';
import RelatedArticles from '../RelatedArticles/RelatedArticles';
import ArticleTags from '../ArticleTags/ArticleTags';
import MoreFromSection from '../../Common/MoreFromSection/MoreFromSection';
import MoreStoriesSection from '../../Common/MoreStories/MoreStories';
import { technologyMoreStories } from '@/Data/moreStoriesData/moreStoriesData';

interface ArticleData {
  id: string | number;
  section: string;
  category: string;
  title: string;
  subtitle: string;  
  image: string;
  date: string;
  author?: string;
  readTime?: string;
  content: string;
  tags?: string[];
  slug: string;
}

interface SidebarNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug: string;
  section: string;
  category: string;
}

interface RelatedArticle {
  id: string | number;
  title: string;
  slug: string;
  section?: string;
  category?: string;
  image?: string;
}

interface ArticlePageClientProps {
  article: ArticleData;
  relatedArticles: RelatedArticle[];
  topNews: SidebarNewsItem[];
  recommendedStories: SidebarNewsItem[];
  section: string;
  category: string;
}

export default function ArticlePageClient({
  article,
  relatedArticles,
  topNews,
  recommendedStories,
  section,
  category
}: ArticlePageClientProps) {
  console.log('ArticlePageClient received:', article);
  
  return (
    <div className={styles.articlePage}>
      <div className={styles.container}>
        <Breadcrumb 
          section={section}
          category={category}
          title={article.title}
        />

        <div className={styles.articleLayout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            <ArticleHeader article={article} />
            <ArticleContent content={article.content} />
            <RelatedArticles articles={relatedArticles} />
            {article.tags && article.tags.length > 0 && (
              <ArticleTags tags={article.tags} />
            )}
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.adSpace}>
              <div className={styles.advertisement}>ADVERTISEMENT</div>
              <div className={styles.adPlaceholder}>
                {/* Ad banner placeholder */}
              </div>
            </div>
            
            <TopNewsSidebar news={topNews} />
            
            <div className={styles.adSpace}>
              <div className={styles.advertisement}>ADVERTISEMENT</div>
              <div className={styles.adPlaceholder}>
                {/* Ad banner placeholder */}
              </div>
            </div>
          </aside>
        </div>
        <MoreStoriesSection stories={technologyMoreStories} title={`MORE FROM ${section.toUpperCase()}`} />
      </div>
    </div>
  );
}
