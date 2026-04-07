import React from 'react';
import styles from './NewsSection.module.scss';

const NewsSection: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      {/* INDIA SECTION */}
      <section className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>India</h2>
          <nav className={styles.subCategoryNav}>
            {['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Delhi', 'Bihar', 'Madhya Pradesh', 'Rajasthan', 'Haryana', 'Chhattisgarh'].map(cat => (
              <span key={cat}>{cat}</span>
            ))}
          </nav>
        </div>
        <div className={styles.indiaLayout}>
          <div className={styles.mainGrid}>
            <NewsCard image="/path-to-crash.jpg" title="'Runway was not in sight...': Crew to ATC moments before Ajit Pawar's plane crashed in Baramati" />
            <NewsCard image="/path-to-bandh.jpg" title="Odisha Bandh highlights: Normal life disrupted, NNKS workers block Puri-Bhubaneswar road" />
            <NewsCard image="/path-to-ajit.jpg" title="Ajit Pawar dies at 66, Mamata Banerjee demands probe into Baramati plane crash" />
            <NewsCard image="/path-to-summit.jpg" title="India-EU Summit yields 13 major agreements: From historic FTA to green energy" />
            <NewsCard image="/path-to-clash.jpg" title="Jharkhand: 15 people, 4 policemen injured as violent clash erupts in Ramgarh" />
            <NewsCard image="/path-to-odisha.jpg" title="Odisha Bandh today: Are schools, colleges, banks, govt offices closed?" />
          </div>
          <aside className={styles.sidebar}>
            <div className={styles.adPlaceholder}>ADVERTISEMENT</div>
            <h3 className={styles.topNewsTitle}>Top News</h3>
            <div className={styles.topNewsItem}>
              <p>Ajit Pawar death: Devendra Fadnavis expresses grief, announces mourning</p>
              <img src="/thumb1.jpg" alt="thumb" />
            </div>
            <div className={styles.topNewsItem}>
              <p>Ajit Pawar plane crash: Supriya Sule and Parth reach Baramati | Video</p>
              <img src="/thumb2.jpg" alt="thumb" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

// Sub-components for cleaner code
const NewsCard = ({ image, title }: any) => (
  <div className={styles.newsCard}>
    <img src={image} alt="news" />
    <p>{title}</p>
  </div>
);


export default NewsSection;
