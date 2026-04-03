// app/Components/KeySeriesSection/KeySeriesSection.tsx
'use client';
import React, { useState } from 'react';
import styles from './KeySeriesSection.module.scss';
import Image from 'next/image';

interface TeamInfo {
  code: string;
  name: string;
  flag: string;
  score?: string;
}

interface MatchCard {
  id: string;
  isLive: boolean;
  category: string;
  title: string;
  venue: string;
  team1: TeamInfo;
  team2: TeamInfo;
  matchStatus: string;
  startTime?: string;
}

const allMatchesData: MatchCard[] = [
  {
    id: '1',
    isLive: true,
    category: 'ICC Under 19 World Cup',
    title: 'Afghanistan Under-19s vs Ireland Under-19s, 9th Match Super Six Group I, Harare',
    venue: 'Harare',
    team1: {
      code: 'AFG-U19',
      name: 'Afghanistan',
      flag: '/flags/afg.png',
      score: '114/3 (23.2 ov)'
    },
    team2: {
      code: 'IRE-U19',
      name: 'Ireland',
      flag: '/flags/ire.png'
    },
    matchStatus: 'Afghanistan Under-19s elected to bat'
  },
  {
    id: '2',
    isLive: true,
    category: 'ICC Under 19 World Cup',
    title: 'New Zealand Under-19s vs England Under-19s, 10th Match Super Six Group II, Queens',
    venue: 'Queens',
    team1: {
      code: 'NZ-U19',
      name: 'New Zealand',
      flag: '/flags/nz.png'
    },
    team2: {
      code: 'ENG-U19',
      name: 'England',
      flag: '/flags/eng.png',
      score: '102/2 (23.5 ov)'
    },
    matchStatus: 'New Zealand Under-19s elected to bowl'
  },
  {
    id: '3',
    isLive: false,
    category: "Women's Premier League",
    title: 'Gujarat Giants Women vs Mumbai Indians Women, Match 19, Kotambi Stadium, India',
    venue: 'Kotambi Stadium, India',
    team1: {
      code: 'GG-W',
      name: 'Gujarat Giants',
      flag: '/teams/gg.png'
    },
    team2: {
      code: 'MI-W',
      name: 'Mumbai Indians',
      flag: '/teams/mi.png'
    },
    matchStatus: '',
    startTime: 'Match Starts 30 January, 2026 19:30 IST'
  },
  {
    id: '4',
    isLive: false,
    category: "Women's Premier League",
    title: 'Delhi Capitals Women vs Uttar Pradesh Warriors Women, Match 20, Kotambi Stadium, India',
    venue: 'Kotambi Stadium, India',
    team1: {
      code: 'DC-W',
      name: 'Delhi Capitals',
      flag: '/teams/dc.png'
    },
    team2: {
      code: 'UPW-W',
      name: 'UP Warriors',
      flag: '/teams/upw.png'
    },
    matchStatus: '',
    startTime: 'Match Starts 01 February, 2026 19:30 IST'
  },
  {
    id: '5',
    isLive: false,
    category: 'New Zealand tour of India',
    title: 'India vs New Zealand, 3rd T20I, Eden Gardens, Kolkata',
    venue: 'Eden Gardens, Kolkata',
    team1: {
      code: 'IND',
      name: 'India',
      flag: '/flags/ind.png'
    },
    team2: {
      code: 'NZ',
      name: 'New Zealand',
      flag: '/flags/nz.png'
    },
    matchStatus: '',
    startTime: 'Match Starts 02 February, 2026 19:00 IST'
  },
  {
    id: '6',
    isLive: false,
    category: "ICC Men's T20 World Cup",
    title: 'India vs Pakistan, Group Stage, Dubai International Stadium',
    venue: 'Dubai',
    team1: {
      code: 'IND',
      name: 'India',
      flag: '/flags/ind.png'
    },
    team2: {
      code: 'PAK',
      name: 'Pakistan',
      flag: '/flags/pak.png'
    },
    matchStatus: '',
    startTime: 'Match Starts 15 March, 2026 19:30 IST'
  }
];

const KeySeriesSection: React.FC = () => {
  const categories = [
    "Women's Premier League",
    'New Zealand tour of India',
    'ICC Under 19 World Cup',
    "ICC Men's T20 World Cup"
  ];

  const [activeTab, setActiveTab] = useState(0);

  const filteredMatches = allMatchesData.filter(match => {
    const categoriesList = Array.isArray(match.category) ? match.category : [match.category];
    return categoriesList.includes(categories[activeTab]);
  });

  const displayMatches = filteredMatches.length > 0 ? filteredMatches : allMatchesData.slice(0, 4);

  return (
    <section className={styles.keySeriesWrapper}>
      <div className={styles.containerInner}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}></div>
            <h2 className={styles.title}>Key Series</h2>
          </div>
          <div className={styles.categories}>
            {categories.map((category, index) => (
              <button 
                key={index} 
                className={`${styles.categoryTab} ${activeTab === index ? styles.active : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.matchesContainer}>
          <div className={styles.matchesGrid}>
            {displayMatches.map((match, index) => (
              <div 
                key={match.id} 
                className={styles.matchCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.categoryBadge}>{Array.isArray(match.category) ? match.category[0] : match.category}</span>
                  {match.isLive && (
                    <span className={styles.liveBadge}>
                      <span className={styles.liveIcon}>●</span>
                      LIVE
                    </span>
                  )}
                </div>

                <p className={styles.matchTitle}>{match.title}</p>

                <div className={styles.teamsContainer}>
                  <div className={styles.teamRow}>
                    <div className={styles.teamInfo}>
                      <div className={styles.flagWrapper}>
                        <Image 
                          src={match.team1.flag} 
                          alt={match.team1.name}
                          width={24}
                          height={24}
                          className={styles.flag}
                        />
                      </div>
                      <span className={styles.teamCode}>{match.team1.code}</span>
                    </div>
                    {match.team1.score && (
                      <span className={styles.score}>{match.team1.score}</span>
                    )}
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.teamRow}>
                    <div className={styles.teamInfo}>
                      <div className={styles.flagWrapper}>
                        <Image 
                          src={match.team2.flag} 
                          alt={match.team2.name}
                          width={24}
                          height={24}
                          className={styles.flag}
                        />
                      </div>
                      <span className={styles.teamCode}>{match.team2.code}</span>
                    </div>
                    {match.team2.score && (
                      <span className={styles.score}>{match.team2.score}</span>
                    )}
                  </div>
                </div>

                {match.matchStatus && (
                  <div className={styles.statusBadge}>
                    <div className={styles.statusBorder}></div>
                    <p className={styles.matchStatus}>{match.matchStatus}</p>
                  </div>
                )}
                {match.startTime && (
                  <div className={styles.statusBadge}>
                    <div className={styles.statusBorder}></div>
                    <p className={styles.startTime}>{match.startTime}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className={styles.nextButton} aria-label="Next matches">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.bannerWrapper}>
          <div className={styles.bannerGlow}></div>
          <Image 
            src="/images/t20-world-cup-2026.jpg" 
            alt="T20 World Cup 2026"
            width={1400}
            height={200}
            className={styles.banner}
          />
        </div>
      </div>
    </section>
  );
};

export default KeySeriesSection;
