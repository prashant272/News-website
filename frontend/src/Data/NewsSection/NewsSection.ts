export interface NewsGridItem {
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
}

export interface TopNewsItem {
  id: string | number;
  title: string;
  image: string;
  slug?: string;
}

export interface SectionData {
  sectionTitle: string;
  subCategories: string[];
  mainNews: NewsGridItem[];
  topNews: TopNewsItem[];
}

export interface PhotoItem {
  id: string | number;
  image: string;
  title: string;
  slug?: string;
  category?: string;
  description?: string;
}

export const indiaMainNews: NewsGridItem[] = [
  {
    id: 'india-1',
    image: '/images/ajit-pawar-plane-crash.jpg',
    title: "'Runway was not in sight...': Crew to ATC moments before Ajit Pawar's plane crashed in Baramati",
    slug: 'ajit-pawar-maharashtra-crisis-2026',
    category: 'Maharashtra'
  },
  {
    id: 'india-2',
    image: '/images/odisha-bandh.jpg',
    title: 'Odisha Bandh highlights: Normal life disrupted, NNKS workers block Puri-Bhubaneswar road',
    slug: 'odisha-bandh-highlights-disruption',
    category: 'Odisha'
  },
  {
    id: 'india-3',
    image: '/images/ajit-pawar-death.jpg',
    title: 'Ajit Pawar dies at 66, Mamata Banerjee demands probe into Baramati plane crash',
    slug: 'ajit-pawar-death-mamata-probe-demand',
    category: 'Maharashtra'
  },
  {
    id: 'india-4',
    image: '/images/india-eu-summit.jpg',
    title: 'India-EU Summit yields 13 major agreements: From historic FTA to green energy',
    slug: 'india-eu-summit-fta-agreements',
    category: 'National'
  },
  {
    id: 'india-5',
    image: '/images/jharkhand-clash.jpg',
    title: 'Jharkhand: 15 people, 4 policemen injured as violent clash erupts in Ramgarh',
    slug: 'jharkhand-ramgarh-violent-clash',
    category: 'Jharkhand'
  },
  {
    id: 'india-6',
    image: '/images/odisha-bandh-closure.jpg',
    title: 'Odisha Bandh today: Are schools, colleges, banks, govt offices closed?',
    slug: 'odisha-bandh-schools-banks-closure',
    category: 'Odisha'
  }
];

export const indiaTopNews: TopNewsItem[] = [
  {
    id: 'india-top-1',
    title: 'Ajit Pawar death: Devendra Fadnavis expresses grief, announces state mourning',
    image: '/images/fadnavis-mourning.jpg',
    slug: 'ajit-pawar-maharashtra-crisis-2026'
  },
  {
    id: 'india-top-2',
    title: 'Ajit Pawar plane crash: Supriya Sule and Parth reach Baramati | Video',
    image: '/images/supriya-sule-baramati.jpg',
    slug: 'supriya-sule-baramati-video'
  },
  {
    id: 'india-top-3',
    title: 'Maharashtra political crisis: Emergency cabinet meeting called',
    image: '/images/maharashtra-cabinet.jpg',
    slug: 'maharashtra-cabinet-emergency-meeting'
  },
  {
    id: 'india-top-4',
    title: 'Budget 2026: Finance Minister to present budget on February 1',
    image: '/images/budget-2026-fm.jpg',
    slug: 'budget-2026-february-presentation'
  }
];

export const indiaSubCategories = [
  'Maharashtra',
  'Karnataka',
  'Uttar Pradesh',
  'Delhi',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'Haryana',
  'Chhattisgarh'
];

export const indiaSectionData: SectionData = {
  sectionTitle: 'India',
  subCategories: indiaSubCategories,
  mainNews: indiaMainNews,
  topNews: indiaTopNews
};

export const worldMainNews: NewsGridItem[] = [
  {
    id: 'world-1',
    category: 'USA',
    title: 'Donald Trump announces major policy changes in first week as 47th US President',
    image: '/images/trump-policy-changes.jpg',
    slug: 'trump-policy-changes-first-week',
  },
  {
    id: 'world-2',
    category: 'Europe',
    title: 'Russia-Ukraine peace talks resume in Geneva, both sides express optimism for ceasefire',
    image: '/images/russia-ukraine-peace-talks.jpg',
    slug: 'russia-ukraine-peace-talks-geneva',
  },
  {
    id: 'world-3',
    category: 'Middle East',
    title: 'Israel-Gaza conflict: UN Security Council passes resolution for immediate humanitarian aid',
    image: '/images/israel-gaza-un-resolution.jpg',
    slug: 'israel-gaza-un-humanitarian-aid',
  },
  {
    id: 'world-4',
    category: 'Asia Pacific',
    title: 'China launches new space station module, invites international astronauts for collaboration',
    image: '/images/china-space-station-launch.jpg',
    slug: 'china-space-station-international',
  },
  {
    id: 'world-5',
    category: 'Europe',
    title: 'UK economy shows recovery: GDP growth exceeds expectations in Q4 2025',
    image: '/images/uk-economy-gdp-growth.jpg',
    slug: 'uk-economy-gdp-growth-q4',
  },
  {
    id: 'world-6',
    category: 'Climate',
    title: 'Climate summit in Paris: World leaders commit to net-zero emissions by 2040',
    image: '/images/climate-summit-paris-2026.jpg',
    slug: 'climate-summit-paris-net-zero',
  },
  {
    id: 'world-7',
    category: 'Asia Pacific',
    title: 'Japan unveils bullet train capable of 400 km/h speed, connects Tokyo to Osaka in 1 hour',
    image: '/images/japan-bullet-train-400kmph.jpg',
    slug: 'japan-bullet-train-400-kmph',
  },
  {
    id: 'world-8',
    category: 'Europe',
    title: 'NATO Summit 2026: Alliance members pledge increased defense spending amid tensions',
    image: '/images/nato-summit-2026-defense.jpg',
    slug: 'nato-summit-defense-spending',
  },
  {
    id: 'world-9',
    category: 'Africa',
    title: 'South Africa elections 2026: ANC faces biggest challenge in three decades',
    image: '/images/south-africa-elections-anc.jpg',
    slug: 'south-africa-elections-anc-challenge',
  },
  {
    id: 'world-10',
    category: 'Latin America',
    title: 'Brazil announces major initiative to combat Amazon deforestation with $10B fund',
    image: '/images/brazil-amazon-deforestation.jpg',
    slug: 'brazil-amazon-deforestation-initiative',
  },
  {
    id: 'world-11',
    category: 'Australia',
    title: 'Australia battles worst bushfire season in decade, thousands evacuated from Sydney',
    image: '/images/australia-bushfires-sydney.jpg',
    slug: 'australia-bushfires-evacuation',
  },
  {
    id: 'world-12',
    category: 'Middle East',
    title: 'Saudi Arabia announces Vision 2040: Ambitious plan to diversify economy beyond oil',
    image: '/images/saudi-vision-2040-economy.jpg',
    slug: 'saudi-vision-2040-economic-plan',
  },
];

export const worldTopNews: TopNewsItem[] = [
  {
    id: 'world-top-1',
    title: 'Trump announces major policy changes in first week as President',
    image: '/images/trump-policy-changes.jpg',
    slug: 'trump-policy-changes-first-week'
  },
  {
    id: 'world-top-2',
    title: 'NATO Summit 2026: Defense ministers discuss Ukraine support',
    image: '/images/nato-summit-ukraine.jpg',
    slug: 'nato-summit-ukraine-support'
  },
  {
    id: 'world-top-3',
    title: 'Climate summit reaches historic agreement on carbon emissions',
    image: '/images/climate-summit-agreement.jpg',
    slug: 'climate-summit-carbon-agreement'
  },
  {
    id: 'world-top-4',
    title: 'G20 Summit: World leaders commit to global economic recovery plan',
    image: '/images/g20-summit-recovery.jpg',
    slug: 'g20-summit-economic-recovery'
  }
];

export const worldSubCategories = [
  'USA',
  'Europe',
  'Middle East',
  'Asia Pacific',
  'Africa',
  'Latin America',
  'Australia'
];

export const worldSectionData: SectionData = {
  sectionTitle: 'World',
  subCategories: worldSubCategories,
  mainNews: worldMainNews,
  topNews: worldTopNews
};

export const businessMainNews: NewsGridItem[] = [
  {
    id: 'business-1',
    image: '/images/sensex-record-high.jpg',
    title: 'Sensex crosses 85,000 mark for first time, Nifty at record high driven by IT stocks',
    slug: 'sensex-85000-nifty-record-high',
    category: 'Markets'
  },
  {
    id: 'business-2',
    image: '/images/reliance-jio.jpg',
    title: 'Reliance Jio announces nationwide 5G rollout completion, aims for 6G by 2030',
    slug: 'reliance-jio-5g-rollout-6g-plans',
    category: 'Telecom'
  },
  {
    id: 'business-3',
    image: '/images/tata-electric-cars.jpg',
    title: 'Tata Motors launches 3 new electric vehicles, targets 50% EV sales by 2027',
    slug: 'tata-motors-new-ev-launch',
    category: 'Automobile'
  },
  {
    id: 'business-4',
    image: '/images/startup-funding.jpg',
    title: 'Indian startups raise $12 billion in 2025, highest funding year since 2021',
    slug: 'indian-startups-funding-2025',
    category: 'Startups'
  },
  {
    id: 'business-5',
    image: '/images/rupee-dollar.jpg',
    title: 'Rupee strengthens to 82 per dollar, strongest level in 6 months',
    slug: 'rupee-strengthens-82-dollar',
    category: 'Currency'
  },
  {
    id: 'business-6',
    image: '/images/gold-prices.jpg',
    title: 'Gold prices surge to all-time high of Rs 1,80,000 per 10 grams amid global uncertainty',
    slug: 'gold-prices-all-time-high',
    category: 'Commodities'
  }
];

export const businessTopNews: TopNewsItem[] = [
  {
    id: 'business-top-1',
    title: 'RBI keeps repo rate unchanged at 6.5%, focuses on inflation control',
    image: '/images/rbi-monetary-policy.jpg',
    slug: 'rbi-repo-rate-unchanged-inflation'
  },
  {
    id: 'business-top-2',
    title: 'Adani Group stocks rally 15% after clearing all regulatory concerns',
    image: '/images/adani-stocks-rally.jpg',
    slug: 'adani-stocks-rally-regulatory-clearance'
  },
  {
    id: 'business-top-3',
    title: 'Apple to manufacture iPhone 16 Pro in India, creating 50,000 jobs',
    image: '/images/apple-india-manufacturing.jpg',
    slug: 'apple-iphone-16-pro-india-manufacturing'
  },
  {
    id: 'business-top-4',
    title: 'Oil prices fall below $70 per barrel amid weak global demand',
    image: '/images/oil-prices-fall.jpg',
    slug: 'oil-prices-fall-weak-demand'
  }
];

export const businessSubCategories = [
  'Markets',
  'Economy',
  'Banking',
  'Startups',
  'Cryptocurrency',
  'Real Estate',
  'IPO'
];

export const businessSectionData: SectionData = {
  sectionTitle: 'Business',
  subCategories: businessSubCategories,
  mainNews: businessMainNews,
  topNews: businessTopNews
};

export const technologyMainNews: NewsGridItem[] = [
  {
    id: 'tech-1',
    image: '/images/chatgpt-5.jpg',
    title: 'OpenAI unveils GPT-5: Most advanced AI model with reasoning capabilities',
    slug: 'openai-gpt-5-launch-features',
    category: 'AI'
  },
  {
    id: 'tech-2',
    image: '/images/google-pixel-9.jpg',
    title: 'Google Pixel 9 Pro launched in India with advanced AI photography at Rs 89,999',
    slug: 'google-pixel-9-pro-india-launch',
    category: 'Smartphones'
  },
  {
    id: 'tech-3',
    image: '/images/meta-quest-4.jpg',
    title: 'Meta Quest 4 VR headset unveiled with mixed reality features, priced at $499',
    slug: 'meta-quest-4-vr-headset-launch',
    category: 'VR/AR'
  },
  {
    id: 'tech-4',
    image: '/images/tesla-cybertruck.jpg',
    title: 'Tesla Cybertruck gets major update: New features and $10,000 price reduction',
    slug: 'tesla-cybertruck-update-price-cut',
    category: 'Electric Vehicles'
  },
  {
    id: 'tech-5',
    image: '/images/apple-vision-pro.jpg',
    title: 'Apple Vision Pro 2 coming to India in March 2026, pre-orders start February 1',
    slug: 'apple-vision-pro-2-india-launch',
    category: 'AR/VR'
  },
  {
    id: 'tech-6',
    image: '/images/quantum-computing.jpg',
    title: 'IBM unveils 1000-qubit quantum computer, breakthrough in computing power',
    slug: 'ibm-quantum-computer-1000-qubit',
    category: 'Computing'
  }
];

export const technologyTopNews: TopNewsItem[] = [
  {
    id: 'tech-top-1',
    title: 'Microsoft integrates GPT-5 into Office 365, revolutionizing productivity',
    image: '/images/microsoft-gpt5-office.jpg',
    slug: 'microsoft-gpt5-office-365-integration'
  },
  {
    id: 'tech-top-2',
    title: 'Samsung Galaxy S26 Ultra leak reveals 200MP camera and 6000mAh battery',
    image: '/images/samsung-s26-ultra-leak.jpg',
    slug: 'samsung-galaxy-s26-ultra-leak'
  },
  {
    id: 'tech-top-3',
    title: 'YouTube launches AI-powered video editing tools for creators',
    image: '/images/youtube-ai-editing.jpg',
    slug: 'youtube-ai-video-editing-tools'
  },
  {
    id: 'tech-top-4',
    title: 'SpaceX Starship completes successful orbital flight, Mars mission closer',
    image: '/images/spacex-starship-success.jpg',
    slug: 'spacex-starship-orbital-flight-success'
  }
];

export const technologySubCategories = [
  'AI',
  'Smartphones',
  'Gadgets',
  'Apps',
  'Gaming',
  'Cybersecurity',
  'Science'
];

export const technologySectionData: SectionData = {
  sectionTitle: 'Technology',
  subCategories: technologySubCategories,
  mainNews: technologyMainNews,
  topNews: technologyTopNews
};

export const sportsMainNews: NewsGridItem[] = [
  {
    id: 'sports-1',
    image: '/images/india-vs-australia.jpg',
    title: 'India vs Australia 5th Test: Virat Kohli scores century, India in commanding position',
    slug: 'india-australia-5th-test-kohli-century',
    category: 'Cricket'
  },
  {
    id: 'sports-2',
    image: '/images/djokovic-australian-open.jpg',
    title: 'Novak Djokovic wins 25th Grand Slam at Australian Open 2026, breaks all records',
    slug: 'djokovic-australian-open-25th-grand-slam',
    category: 'Tennis'
  },
  {
    id: 'sports-3',
    image: '/images/ipl-mega-auction.jpg',
    title: 'IPL 2026 Mega Auction: Mumbai Indians spend Rs 25 crore on young batting sensation',
    slug: 'ipl-2026-mega-auction-records',
    category: 'IPL'
  },
  {
    id: 'sports-4',
    image: '/images/neeraj-chopra.jpg',
    title: 'Neeraj Chopra breaks world record with 92.15m throw at Diamond League',
    slug: 'neeraj-chopra-world-record-diamond-league',
    category: 'Athletics'
  },
  {
    id: 'sports-5',
    image: '/images/fifa-world-cup.jpg',
    title: 'FIFA World Cup 2026: India qualifies for first time, nation celebrates historic moment',
    slug: 'fifa-world-cup-2026-india-qualifies',
    category: 'Football'
  },
  {
    id: 'sports-6',
    image: '/images/pv-sindhu.jpg',
    title: 'PV Sindhu wins All England Championship, third major title of the year',
    slug: 'pv-sindhu-all-england-championship-win',
    category: 'Badminton'
  }
];

export const sportsTopNews: TopNewsItem[] = [
  {
    id: 'sports-top-1',
    title: 'Rohit Sharma announces retirement from Test cricket after Australia series',
    image: '/images/rohit-retirement.jpg',
    slug: 'rohit-sharma-test-retirement'
  },
  {
    id: 'sports-top-2',
    title: 'Real Madrid signs Indian footballer for Rs 50 crore, historic deal',
    image: '/images/indian-footballer-real-madrid.jpg',
    slug: 'indian-footballer-real-madrid-signing'
  },
  {
    id: 'sports-top-3',
    title: 'Paris Olympics 2028: India announces 300-member contingent',
    image: '/images/paris-olympics-india.jpg',
    slug: 'paris-olympics-2028-india-contingent'
  },
  {
    id: 'sports-top-4',
    title: 'MS Dhoni makes comeback to international cricket at 44',
    image: '/images/dhoni-comeback.jpg',
    slug: 'ms-dhoni-international-comeback'
  }
];

export const sportsSubCategories = [
  'Cricket',
  'Football',
  'Tennis',
  'Badminton',
  'Hockey',
  'Athletics',
  'Wrestling'
];

export const sportsSectionData: SectionData = {
  sectionTitle: 'Sports',
  subCategories: sportsSubCategories,
  mainNews: sportsMainNews,
  topNews: sportsTopNews
};

export const entertainmentMainNews: NewsGridItem[] = [
  {
    id: 'ent-main-1',
    image: '/images/srk-rajkumar-hirani-announcement.jpg',
    title: 'Shah Rukh Khan announces new film with Rajkumar Hirani, shooting starts in March 2026',
    slug: 'srk-rajkumar-hirani-new-film',
    category: 'Bollywood'
  },
  {
    id: 'ent-main-2',
    image: '/images/arijit-singh-retirement.jpg',
    title: "Arijit Singh announces surprise retirement: Here's why fans think it's a 'rebellion'",
    slug: 'arijit-singh-retirement-rebellion',
    category: 'Music'
  },
  {
    id: 'ent-main-3',
    image: '/images/netflix-indian-originals.jpg',
    title: 'Netflix announces 15 new Indian originals for 2026, including Mirzapur Season 4',
    slug: 'netflix-indian-originals-mirzapur-4',
    category: 'OTT'
  },
  {
    id: 'ent-main-4',
    image: '/images/alia-ranbir-second-child.jpg',
    title: 'Alia Bhatt and Ranbir Kapoor welcome second child, share heartwarming announcement',
    slug: 'alia-ranbir-second-child-announcement',
    category: 'Bollywood'
  },
  {
    id: 'ent-main-5',
    image: '/images/oscar-nominations-indian-film.jpg',
    title: 'Oscar nominations 2026: Indian film enters final 5 in Best International Feature category',
    slug: 'oscar-nominations-2026-indian-film',
    category: 'Awards'
  },
  {
    id: 'ent-main-6',
    image: '/images/taylor-swift-india-tour.jpg',
    title: 'Taylor Swift announces India tour 2026: Mumbai and Delhi concerts confirmed',
    slug: 'taylor-swift-india-tour-mumbai-delhi',
    category: 'Music'
  }
];

export const entertainmentTopNews: TopNewsItem[] = [
  {
    id: 'ent-top-1',
    title: "Karan Wahi breaks silence on wedding rumours with Jennifer Winget: 'Free ki publicity'",
    image: '/images/karan-wahi-jennifer-winget.jpg',
    slug: 'karan-wahi-jennifer-winget-wedding-rumours'
  },
  {
    id: 'ent-top-2',
    title: 'AR Rahman collaborates with Coldplay for India tour anthem, releases February 1',
    image: '/images/ar-rahman-coldplay.jpg',
    slug: 'ar-rahman-coldplay-india-tour-anthem'
  },
  {
    id: 'ent-top-3',
    title: 'Kapil Sharma Show returns with new season, Salman Khan as first guest',
    image: '/images/kapil-sharma-show-season.jpg',
    slug: 'kapil-sharma-show-new-season-guests'
  },
  {
    id: 'ent-top-4',
    title: 'Salman Khan and Katrina Kaif reunite for Tiger 4, December 2026 release',
    image: '/images/salman-katrina-tiger-4.jpg',
    slug: 'salman-katrina-tiger-4-announcement'
  }
];

export const entertainmentSubCategories = [
  'Bollywood',
  'Hollywood',
  'Television',
  'OTT',
  'Music',
  'Regional Cinema',
  'Web Series',
  'Celebrity News',
  'Box Office'
];

export const entertainmentSectionData: SectionData = {
  sectionTitle: 'Entertainment',
  subCategories: entertainmentSubCategories,
  mainNews: entertainmentMainNews,
  topNews: entertainmentTopNews
};

export const lifestyleMainNews: NewsGridItem[] = [
  {
    id: 'lifestyle-1',
    category: 'Wellness',
    title: "Analog living becomes 2026's biggest lifestyle shift: People ditch quick commerce for mindful shopping",
    image: '/images/analog-living-trend-2026.jpg',
    slug: 'analog-living-lifestyle-shift-mindful-shopping',
  },
  {
    id: 'lifestyle-2',
    category: 'Fashion',
    title: 'India sets global fashion trends in 2026: Festive fusion wear dominates international runways',
    image: '/images/india-fashion-trends-global.jpg',
    slug: 'india-fashion-trends-global-fusion-wear',
  },
  {
    id: 'lifestyle-3',
    category: 'Health & Fitness',
    title: 'Brain wealth over brain health: Cognitive longevity becomes top wellness priority for 2026',
    image: '/images/brain-wealth-cognitive-longevity.jpg',
    slug: 'brain-wealth-cognitive-longevity-wellness',
  },
  {
    id: 'lifestyle-4',
    category: 'Travel',
    title: 'Sound healing tourism takes over: Luxury hotels install vibroacoustic therapy beds worth Rs 10 lakh',
    image: '/images/sound-healing-tourism-hotels.jpg',
    slug: 'sound-healing-tourism-vibroacoustic-therapy',
  },
  {
    id: 'lifestyle-5',
    category: 'Wellness',
    title: 'Dry January goes mainstream in India: 32% millennials pledge alcohol-free month for health reset',
    image: '/images/dry-january-india-alcohol-free.jpg',
    slug: 'dry-january-india-alcohol-free-trend',
  },
  {
    id: 'lifestyle-6',
    category: 'Beauty',
    title: 'Weight-loss injections boom: 1.6 million Indians use Ozempic, Mounjaro for wellness goals',
    image: '/images/ozempic-mounjaro-weight-loss-india.jpg',
    slug: 'ozempic-mounjaro-weight-loss-india-boom',
  },
  {
    id: 'lifestyle-7',
    category: 'Travel',
    title: 'Cool-cations replace beach holidays: Alpine wellness retreats see 400% booking surge',
    image: '/images/cool-cations-alpine-wellness-retreats.jpg',
    slug: 'cool-cations-alpine-wellness-retreat-trend',
  },
  {
    id: 'lifestyle-8',
    category: 'Fashion',
    title: 'Sustainable fashion becomes mandatory: Government introduces eco-certification for clothing brands',
    image: '/images/sustainable-fashion-eco-certification.jpg',
    slug: 'sustainable-fashion-eco-certification-mandatory',
  },
  {
    id: 'lifestyle-9',
    category: 'Food',
    title: 'Proffee trend explodes: Protein coffee becomes Rs 500 crore market in India',
    image: '/images/proffee-protein-coffee-market.jpg',
    slug: 'proffee-protein-coffee-market-india',
  },
  {
    id: 'lifestyle-10',
    category: 'Wellness',
    title: 'AI fitness coaches replace gym trainers: 5 million Indians switch to personalized digital workouts',
    image: '/images/ai-fitness-coaches-digital-workouts.jpg',
    slug: 'ai-fitness-coaches-personalized-workouts',
  },
  {
    id: 'lifestyle-11',
    category: 'Travel',
    title: 'Forest bathing retreats in Uttarakhand booked till December: Shinrin-yoku therapy gains popularity',
    image: '/images/forest-bathing-uttarakhand-shinrin-yoku.jpg',
    slug: 'forest-bathing-uttarakhand-shinrin-yoku-therapy',
  },
  {
    id: 'lifestyle-12',
    category: 'Health & Fitness',
    title: 'Walking pad craze hits India: Under-desk treadmills sell out within hours of restocking',
    image: '/images/walking-pad-treadmill-india-sold-out.jpg',
    slug: 'walking-pad-under-desk-treadmill-sold-out',
  },
];

export const lifestyleTopNews: TopNewsItem[] = [
  {
    id: 'lifestyle-top-1',
    title: 'AI fitness coaches replace gym trainers: Is rewired wellness the future?',
    image: '/images/ai-fitness-coaches.jpg',
    slug: 'ai-fitness-coaches-rewired-wellness'
  },
  {
    id: 'lifestyle-top-2',
    title: 'Goa becomes first Indian state to ban single-use plastics at beaches',
    image: '/images/goa-plastic-ban-beaches.jpg',
    slug: 'goa-single-use-plastic-ban-beaches'
  },
  {
    id: 'lifestyle-top-3',
    title: 'Intermittent fasting vs time-restricted eating: What science says in 2026',
    image: '/images/intermittent-fasting-science.jpg',
    slug: 'intermittent-fasting-time-restricted-eating-science'
  },
  {
    id: 'lifestyle-top-4',
    title: 'Vintage fashion revival: Gen Z drives 400% increase in thrift store shopping',
    image: '/images/vintage-fashion-gen-z-thrift.jpg',
    slug: 'vintage-fashion-gen-z-thrift-shopping'
  }
];

export const lifestyleSubCategories = [
  'Travel',
  'Food',
  'Health & Fitness',
  'Fashion',
  'Beauty',
  'Wellness',
  'Home & Living',
  'Relationships',
  'Parenting'
];

export const lifestyleSectionData: SectionData = {
  sectionTitle: 'Lifestyle',
  subCategories: lifestyleSubCategories,
  mainNews: lifestyleMainNews,
  topNews: lifestyleTopNews
};

export const lifestyleTravelNews: NewsGridItem[] = [
  {
    id: 'travel-1',
    image: '/images/ladakh-winter-tourism.jpg',
    title: 'Ladakh opens for winter tourism: 7 offbeat destinations for snow lovers',
    slug: 'digital-detox-retreats-himalaya-slowcations',
    category: 'Travel'
  },
  {
    id: 'travel-2',
    image: '/images/forest-bathing-uttarakhand.jpg',
    title: 'Forest bathing retreats in Uttarakhand: Shinrin-yoku trend reaches India',
    slug: 'forest-bathing-uttarakhand-shinrin-yoku',
    category: 'Travel'
  },
  {
    id: 'travel-3',
    image: '/images/workation-goa.jpg',
    title: 'Workation visas launched: Goa and Bangalore offer 3-month stays for digital nomads',
    slug: 'workation-visa-goa-bangalore-digital-nomads',
    category: 'Travel'
  },
  {
    id: 'travel-4',
    image: '/images/spiritual-tourism-varanasi.jpg',
    title: 'Spiritual tourism boom: Varanasi welcomes 5 million wellness seekers in 2025',
    slug: 'spiritual-tourism-varanasi-wellness-seekers',
    category: 'Travel'
  },
  {
    id: 'travel-5',
    image: '/images/rail-tourism-india.jpg',
    title: 'Indian Railways launches luxury wellness train: Spa and yoga on wheels',
    slug: 'indian-railways-luxury-wellness-train',
    category: 'Travel'
  },
  {
    id: 'travel-6',
    image: '/images/sustainable-resorts-rajasthan.jpg',
    title: 'Rajasthan heritage hotels go solar: 50 properties achieve net-zero status',
    slug: 'rajasthan-heritage-hotels-solar-net-zero',
    category: 'Travel'
  }
];

export const lifestyleFoodNews: NewsGridItem[] = [
  {
    id: 'food-1',
    image: '/images/fermented-foods-gut-health.jpg',
    title: 'Fermented foods revolution: Why kimchi, kombucha and kefir are trending in India',
    slug: 'fermented-foods-gut-health-india-trend',
    category: 'Food'
  },
  {
    id: 'food-2',
    image: '/images/millet-recipes-superfood.jpg',
    title: 'International Year of Millets impact: 10 delicious millet recipes for weight loss',
    slug: 'millet-recipes-weight-loss-superfood',
    category: 'Food'
  },
  {
    id: 'food-3',
    image: '/images/cloud-kitchen-boom.jpg',
    title: 'Cloud kitchen revolution: How home chefs are earning Rs 2 lakh monthly',
    slug: 'cloud-kitchen-home-chefs-earning',
    category: 'Food'
  },
  {
    id: 'food-4',
    image: '/images/protein-coffee-trend.jpg',
    title: 'Proffee trend takes over: Protein coffee becomes breakfast staple for fitness enthusiasts',
    slug: 'proffee-protein-coffee-breakfast-trend',
    category: 'Food'
  },
  {
    id: 'food-5',
    image: '/images/zero-waste-cooking.jpg',
    title: 'Zero-waste cooking: Celebrity chefs share tips to reduce food waste by 80%',
    slug: 'zero-waste-cooking-tips-celebrity-chefs',
    category: 'Food'
  },
  {
    id: 'food-6',
    image: '/images/molecular-gastronomy-india.jpg',
    title: 'Molecular gastronomy goes mainstream: 5 Indian restaurants redefining fine dining',
    slug: 'molecular-gastronomy-indian-restaurants',
    category: 'Food'
  }
];

export const lifestyleHealthNews: NewsGridItem[] = [
  {
    id: 'health-1',
    image: '/images/walking-pad-home-fitness.jpg',
    title: 'Walking pad craze: Why under-desk treadmills are selling out in India',
    slug: 'walking-pad-under-desk-treadmill-trend',
    category: 'Health & Fitness'
  },
  {
    id: 'health-2',
    image: '/images/sleep-tourism-retreats.jpg',
    title: 'Sleep tourism explodes: Luxury hotels offer Rs 50,000 insomnia-cure packages',
    slug: 'sleep-tourism-insomnia-cure-luxury-hotels',
    category: 'Health & Fitness'
  },
  {
    id: 'health-3',
    image: '/images/breathwork-mental-health.jpg',
    title: 'Breathwork therapy surpasses meditation: Studies show 67% stress reduction',
    slug: 'breathwork-therapy-meditation-stress-reduction',
    category: 'Health & Fitness'
  },
  {
    id: 'health-4',
    image: '/images/biohacking-longevity.jpg',
    title: 'Biohacking for longevity: Indian startups offer personalized health optimization',
    slug: 'biohacking-longevity-health-optimization-india',
    category: 'Health & Fitness'
  },
  {
    id: 'health-5',
    image: '/images/yoga-therapy-medical.jpg',
    title: 'Yoga therapy gets medical recognition: AIIMS launches certification program',
    slug: 'yoga-therapy-medical-recognition-aiims',
    category: 'Health & Fitness'
  },
  {
    id: 'health-6',
    image: '/images/mental-health-apps.jpg',
    title: 'Mental health apps boom: Indian platforms see 500% user growth post-pandemic',
    slug: 'mental-health-apps-india-growth',
    category: 'Health & Fitness'
  }
];

export const lifestyleFashionNews: NewsGridItem[] = [
  {
    id: 'fashion-1',
    image: '/images/indian-textiles-global.jpg',
    title: 'Indian handloom textiles dominate Paris Fashion Week: Khadi goes global',
    slug: 'indian-handloom-paris-fashion-week-khadi',
    category: 'Fashion'
  },
  {
    id: 'fashion-2',
    image: '/images/gender-neutral-fashion.jpg',
    title: 'Gender-neutral fashion breaks barriers: Indian brands lead inclusivity movement',
    slug: 'gender-neutral-fashion-indian-brands',
    category: 'Fashion'
  },
  {
    id: 'fashion-3',
    image: '/images/rental-fashion-platforms.jpg',
    title: 'Fashion rental platforms boom: Rent designer wear at 10% of retail price',
    slug: 'fashion-rental-platforms-designer-wear',
    category: 'Fashion'
  },
  {
    id: 'fashion-4',
    image: '/images/ai-fashion-styling.jpg',
    title: 'AI stylists revolutionize shopping: Virtual try-ons reduce returns by 40%',
    slug: 'ai-fashion-styling-virtual-try-on',
    category: 'Fashion'
  },
  {
    id: 'fashion-5',
    image: '/images/upcycled-fashion-denim.jpg',
    title: 'Upcycled denim trend: Transform old jeans into designer pieces at home',
    slug: 'upcycled-denim-fashion-diy-designer',
    category: 'Fashion'
  },
  {
    id: 'fashion-6',
    image: '/images/traditional-fusion-wear.jpg',
    title: 'Fusion wear dominates weddings: Indo-western outfits see 200% demand spike',
    slug: 'fusion-wear-weddings-indo-western-trend',
    category: 'Fashion'
  }
];

export const lifestyleBeautyNews: NewsGridItem[] = [
  {
    id: 'beauty-1',
    image: '/images/clean-beauty-india.jpg',
    title: 'Clean beauty revolution: Indian brands ditch toxic chemicals, sales soar 300%',
    slug: 'clean-beauty-india-toxic-free-brands',
    category: 'Beauty'
  },
  {
    id: 'beauty-2',
    image: '/images/skinimalism-trend.jpg',
    title: 'Skinimalism replaces 10-step routines: Minimalist skincare becomes Gen Z mantra',
    slug: 'skinimalism-minimalist-skincare-gen-z',
    category: 'Beauty'
  },
  {
    id: 'beauty-3',
    image: '/images/ayurvedic-skincare.jpg',
    title: 'Ayurvedic skincare goes viral: Ancient ingredients dominate beauty counters',
    slug: 'ayurvedic-skincare-ancient-ingredients-viral',
    category: 'Beauty'
  },
  {
    id: 'beauty-4',
    image: '/images/skin-cycling-routine.jpg',
    title: 'Skin cycling explained: Dermatologists reveal the 4-day routine for glowing skin',
    slug: 'skin-cycling-dermatologist-routine-glowing-skin',
    category: 'Beauty'
  },
  {
    id: 'beauty-5',
    image: '/images/waterless-beauty-products.jpg',
    title: 'Waterless beauty products rise: Sustainable cosmetics reduce water waste by 70%',
    slug: 'waterless-beauty-sustainable-cosmetics',
    category: 'Beauty'
  },
  {
    id: 'beauty-6',
    image: '/images/personalized-skincare-ai.jpg',
    title: 'AI-powered skin analysis: Get personalized skincare recommendations in 60 seconds',
    slug: 'ai-skin-analysis-personalized-skincare',
    category: 'Beauty'
  }
];

export const lifestyleWellnessNews: NewsGridItem[] = [
  {
    id: 'wellness-1',
    image: '/images/sound-healing-therapy.jpg',
    title: 'Sound healing therapy gains traction: Singing bowls and gongs cure anxiety',
    slug: 'sound-healing-therapy-anxiety-cure',
    category: 'Wellness'
  },
  {
    id: 'wellness-2',
    image: '/images/wellness-clubs-membership.jpg',
    title: 'Private wellness clubs boom: Exclusive memberships cost Rs 5 lakh annually',
    slug: 'private-wellness-clubs-exclusive-membership',
    category: 'Wellness'
  },
  {
    id: 'wellness-3',
    image: '/images/cold-plunge-therapy.jpg',
    title: 'Cold plunge therapy trend: Ice baths boost immunity and mental clarity',
    slug: 'cold-plunge-therapy-ice-bath-benefits',
    category: 'Wellness'
  },
  {
    id: 'wellness-4',
    image: '/images/menstrual-wellness.jpg',
    title: 'Menstrual wellness movement: Companies offer period leave, products go organic',
    slug: 'menstrual-wellness-period-leave-organic',
    category: 'Wellness'
  },
  {
    id: 'wellness-5',
    image: '/images/gut-health-microbiome.jpg',
    title: 'Gut health testing kits sell out: Personalized probiotic plans based on microbiome',
    slug: 'gut-health-testing-microbiome-probiotics',
    category: 'Wellness'
  },
  {
    id: 'wellness-6',
    image: '/images/longevity-clinics.jpg',
    title: 'Longevity clinics open in Mumbai: Age-reversal treatments starting at Rs 2 lakh',
    slug: 'longevity-clinics-mumbai-age-reversal',
    category: 'Wellness'
  }
];

export const lifestyleHomeNews: NewsGridItem[] = [
  {
    id: 'home-1',
    image: '/images/smart-home-automation.jpg',
    title: 'Smart home revolution: Voice-controlled homes reduce energy bills by 40%',
    slug: 'smart-home-automation-energy-savings',
    category: 'Home & Living'
  },
  {
    id: 'home-2',
    image: '/images/indoor-gardening-urban.jpg',
    title: 'Indoor gardening boom: Urban Indians grow vegetables on balconies',
    slug: 'indoor-gardening-urban-balcony-vegetables',
    category: 'Home & Living'
  },
  {
    id: 'home-3',
    image: '/images/minimalist-home-decor.jpg',
    title: 'Minimalist home decor trend: Japanese wabi-sabi philosophy inspires Indian homes',
    slug: 'minimalist-decor-wabi-sabi-japanese-homes',
    category: 'Home & Living'
  },
  {
    id: 'home-4',
    image: '/images/pet-friendly-homes.jpg',
    title: 'Pet-friendly home design: Architects create spaces for furry family members',
    slug: 'pet-friendly-home-design-architects',
    category: 'Home & Living'
  },
  {
    id: 'home-5',
    image: '/images/home-office-ergonomics.jpg',
    title: 'Work from home ergonomics: 10 must-have products for pain-free productivity',
    slug: 'work-from-home-ergonomics-products',
    category: 'Home & Living'
  },
  {
    id: 'home-6',
    image: '/images/sustainable-home-living.jpg',
    title: 'Zero-waste homes possible: Families share how they produce no garbage',
    slug: 'zero-waste-homes-no-garbage-families',
    category: 'Home & Living'
  }
];

export const allLifestyleNews = {
  travel: lifestyleTravelNews,
  food: lifestyleFoodNews,
  health: lifestyleHealthNews,
  fashion: lifestyleFashionNews,
  beauty: lifestyleBeautyNews,
  wellness: lifestyleWellnessNews,
  home: lifestyleHomeNews
};

export const healthMainNews: NewsGridItem[] = [
  {
    id: 'health-1',
    category: 'Medical Research',
    title: 'Cancer breakthrough: Menin inhibitors approved for 40% of AML cases, survival rates double in trials',
    image: '/images/menin-inhibitors-aml-breakthrough.jpg',
    slug: 'menin-inhibitors-aml-survival-rates-double',
  },
  {
    id: 'health-2',
    category: 'Wellness',
    title: 'GLP-1 medications boom: 1 in 8 Indians use Ozempic, Mounjaro as government slashes prices to Rs 4,000',
    image: '/images/glp1-ozempic-price-slash-india.jpg',
    slug: 'glp1-ozempic-price-slash-4000-rupees',
  },
  {
    id: 'health-3',
    category: 'Digital Health',
    title: 'AI diagnostic tools deployed in 500 Indian hospitals: Disease detection 30% faster, 95% accuracy rate',
    image: '/images/ai-diagnostic-500-hospitals-india.jpg',
    slug: 'ai-diagnostic-500-hospitals-95-percent-accuracy',
  },
  {
    id: 'health-4',
    category: 'Policy',
    title: 'Budget 2026 healthcare allocation: Rs 1 lakh crore for preventive care, NCD screening for adults 30+',
    image: '/images/budget-2026-preventive-care-1-lakh-crore.jpg',
    slug: 'budget-2026-preventive-care-ncd-screening',
  },
  {
    id: 'health-5',
    category: 'Mental Health',
    title: 'National suicide prevention helpline launched: 24/7 support in 12 languages, toll-free across India',
    image: '/images/suicide-prevention-helpline-12-languages.jpg',
    slug: 'suicide-prevention-helpline-24-7-india',
  },
  {
    id: 'health-6',
    category: 'Digital Health',
    title: 'Ayushman Bharat Digital Mission hits 500 million: Universal health ID rollout by December 2026',
    image: '/images/ayushman-bharat-500-million-health-id.jpg',
    slug: 'ayushman-bharat-500-million-universal-health-id',
  },
  {
    id: 'health-7',
    category: 'Medical Research',
    title: 'Pancreatic cancer RAS inhibitor shows 60% survival improvement in phase III clinical trial',
    image: '/images/pancreatic-ras-inhibitor-60-percent.jpg',
    slug: 'pancreatic-ras-inhibitor-60-percent-survival',
  },
  {
    id: 'health-8',
    category: 'Disease Prevention',
    title: 'AIIMS diabetes reversal program: Free 12-week intensive lifestyle intervention shows 70% success rate',
    image: '/images/aiims-diabetes-reversal-70-percent.jpg',
    slug: 'aiims-diabetes-reversal-70-percent-success',
  },
  {
    id: 'health-9',
    category: 'Digital Health',
    title: 'Telemedicine consultations cross 100 million: Indians prefer online doctors, saves Rs 500 per visit',
    image: '/images/telemedicine-100-million-consultations.jpg',
    slug: 'telemedicine-100-million-consultations-india',
  },
  {
    id: 'health-10',
    category: 'Disease Prevention',
    title: 'Tuberculosis cases drop 40%: India on track to eliminate TB by 2030, WHO praises efforts',
    image: '/images/tuberculosis-40-percent-drop-india-2030.jpg',
    slug: 'tuberculosis-40-percent-drop-eliminate-2030',
  },
];

export const healthTopNews: TopNewsItem[] = [
  {
    id: 'health-top-1',
    title: 'Pancreatic cancer treatment revolution: New RAS inhibitor shows 60% survival improvement',
    image: '/images/pancreatic-cancer-ras-inhibitor.jpg',
    slug: 'pancreatic-cancer-ras-inhibitor-survival'
  },
  {
    id: 'health-top-2',
    title: 'Diabetes reversal program: AIIMS launches free 12-week intensive lifestyle intervention',
    image: '/images/diabetes-reversal-aiims-program.jpg',
    slug: 'diabetes-reversal-aiims-lifestyle-program'
  },
  {
    id: 'health-top-3',
    title: 'Telemedicine boom: 100 million consultations in 2025, Indians save Rs 500 per visit',
    image: '/images/telemedicine-100-million-consultations.jpg',
    slug: 'telemedicine-100-million-consultations-india'
  },
  {
    id: 'health-top-4',
    title: 'TB elimination milestone: Cases drop 40%, India on track to end tuberculosis by 2030',
    image: '/images/tuberculosis-40-percent-drop-2030.jpg',
    slug: 'tuberculosis-40-percent-drop-eliminate-2030'
  }
];

export const healthSubCategories = [
  'Medical Research',
  'Mental Health',
  'Wellness',
  'Digital Health',
  'Disease Prevention',
  'Policy'
];

export const healthSectionData: SectionData = {
  sectionTitle: 'Health',
  subCategories: healthSubCategories,
  mainNews: healthMainNews,
  topNews: healthTopNews
};

export const photosSubCategories = [
  'India',
  'Sports',
  'Entertainment',
  'World',
  'Fashion',
  'Lifestyle'
];

export const photosMainNews: NewsGridItem[] = [
  {
    id: 'photo-1',
    image: '/images/ajit-pawar-cremation.jpg',
    title: 'Ajit Pawar cremated with full state honours at Baramati',
    slug: 'ajit-pawar-cremation-full-state-honours',
    category: 'India'
  },
  {
    id: 'photo-2',
    image: '/images/virat-kohli-century-celebration.jpg',
    title: 'Virat Kohli celebrates historic 50th Test century against Australia',
    slug: 'virat-kohli-50th-test-century-celebration',
    category: 'Sports'
  },
  {
    id: 'photo-3',
    image: '/images/taylor-swift-mumbai-concert.jpg',
    title: 'Taylor Swift performs at sold-out Mumbai concert',
    slug: 'taylor-swift-mumbai-concert-sold-out',
    category: 'Entertainment'
  },
  {
    id: 'photo-4',
    image: '/images/trump-white-house-2026.jpg',
    title: 'President Trump signs executive orders in Oval Office',
    slug: 'trump-executive-orders-oval-office',
    category: 'World'
  },
  {
    id: 'photo-5',
    image: '/images/paris-fashion-week-indian-designer.jpg',
    title: 'Indian designer showcases handloom collection at Paris Fashion Week',
    slug: 'indian-designer-paris-fashion-week-handloom',
    category: 'Fashion'
  },
  {
    id: 'photo-6',
    image: '/images/yoga-retreat-rishikesh.jpg',
    title: 'International yoga retreat in Rishikesh attracts wellness seekers',
    slug: 'yoga-retreat-rishikesh-wellness-seekers',
    category: 'Lifestyle'
  },
  {
    id: 'photo-7',
    image: '/images/republic-day-parade-2026.jpg',
    title: 'Republic Day 2026: Spectacular parade showcases India\'s military might',
    slug: 'republic-day-2026-parade-military',
    category: 'India'
  },
  {
    id: 'photo-8',
    image: '/images/djokovic-australian-open-trophy.jpg',
    title: 'Novak Djokovic lifts 25th Grand Slam trophy at Australian Open 2026',
    slug: 'djokovic-25th-grand-slam-australian-open',
    category: 'Sports'
  },
  {
    id: 'photo-9',
    image: '/images/srk-rajkumar-hirani-muhurat.jpg',
    title: 'Shah Rukh Khan and Rajkumar Hirani begin shooting for new film',
    slug: 'srk-rajkumar-hirani-film-muhurat-shot',
    category: 'Entertainment'
  },
  {
    id: 'photo-10',
    image: '/images/russia-ukraine-peace-talks.jpg',
    title: 'Russia-Ukraine peace talks resume in Geneva',
    slug: 'russia-ukraine-peace-talks-geneva',
    category: 'World'
  },
  {
    id: 'photo-11',
    image: '/images/lakme-fashion-week-2026.jpg',
    title: 'Lakme Fashion Week 2026: Models walk the ramp in sustainable fashion',
    slug: 'lakme-fashion-week-sustainable-fashion',
    category: 'Fashion'
  },
  {
    id: 'photo-12',
    image: '/images/forest-bathing-uttarakhand.jpg',
    title: 'Forest bathing retreat in Uttarakhand: Shinrin-yoku therapy',
    slug: 'forest-bathing-uttarakhand-shinrin-yoku',
    category: 'Lifestyle'
  },
  {
    id: 'photo-13',
    image: '/images/kumbh-mela-2026.jpg',
    title: 'Maha Kumbh 2026: Millions take holy dip at Sangam in Prayagraj',
    slug: 'kumbh-mela-2026-prayagraj-sangam',
    category: 'India'
  },
  {
    id: 'photo-14',
    image: '/images/neeraj-chopra-world-record.jpg',
    title: 'Neeraj Chopra breaks world record with 92.15m javelin throw',
    slug: 'neeraj-chopra-world-record-92-15m',
    category: 'Sports'
  },
  {
    id: 'photo-15',
    image: '/images/alia-ranbir-baby-announcement.jpg',
    title: 'Alia Bhatt and Ranbir Kapoor share first photo of second child',
    slug: 'alia-ranbir-second-child-first-photo',
    category: 'Entertainment'
  },
  {
    id: 'photo-16',
    image: '/images/china-space-station-launch.jpg',
    title: 'China launches new space station module',
    slug: 'china-space-station-module-launch',
    category: 'World'
  },
  {
    id: 'photo-17',
    image: '/images/bollywood-met-gala-2026.jpg',
    title: 'Bollywood stars shine at Met Gala 2026',
    slug: 'bollywood-met-gala-2026-red-carpet',
    category: 'Fashion'
  },
  {
    id: 'photo-18',
    image: '/images/sound-healing-session.jpg',
    title: 'Sound healing therapy session at luxury wellness resort',
    slug: 'sound-healing-therapy-luxury-resort',
    category: 'Lifestyle'
  },
  {
    id: 'photo-19',
    image: '/images/farmers-protest-delhi.jpg',
    title: 'Farmers march towards Delhi demanding MSP guarantee',
    slug: 'farmers-protest-delhi-msp-guarantee',
    category: 'India'
  },
  {
    id: 'photo-20',
    image: '/images/ipl-auction-2026.jpg',
    title: 'IPL 2026 Mega Auction: Record Rs 25 crore bid shocks cricket world',
    slug: 'ipl-2026-mega-auction-record-bid',
    category: 'Sports'
  },
  {
    id: 'photo-21',
    image: '/images/oscar-nominations-indian-film.jpg',
    title: 'Indian film team celebrates Oscar nomination',
    slug: 'indian-film-oscar-nomination-celebration',
    category: 'Entertainment'
  },
  {
    id: 'photo-22',
    image: '/images/climate-summit-paris-2026.jpg',
    title: 'World leaders gather at Paris Climate Summit 2026',
    slug: 'world-leaders-paris-climate-summit',
    category: 'World'
  },
  {
    id: 'photo-23',
    image: '/images/gender-neutral-fashion-show.jpg',
    title: 'Gender-neutral fashion show breaks barriers in Mumbai',
    slug: 'gender-neutral-fashion-show-mumbai',
    category: 'Fashion'
  },
  {
    id: 'photo-24',
    image: '/images/vegan-restaurant-opening.jpg',
    title: 'Celebrity chef opens plant-based restaurant in Bangalore',
    slug: 'vegan-restaurant-bangalore-celebrity-chef',
    category: 'Lifestyle'
  }
];

export const photosTopNews: TopNewsItem[] = [
  {
    id: 'photo-top-1',
    title: 'Ajit Pawar cremated with full state honours at Baramati',
    image: '/images/ajit-pawar-cremation.jpg',
    slug: 'ajit-pawar-cremation-full-state-honours'
  },
  {
    id: 'photo-top-2',
    title: 'Virat Kohli celebrates historic 50th Test century',
    image: '/images/virat-kohli-century-celebration.jpg',
    slug: 'virat-kohli-50th-test-century-celebration'
  },
  {
    id: 'photo-top-3',
    title: 'Taylor Swift performs at sold-out Mumbai concert',
    image: '/images/taylor-swift-mumbai-concert.jpg',
    slug: 'taylor-swift-mumbai-concert-sold-out'
  },
  {
    id: 'photo-top-4',
    title: 'Republic Day 2026: India showcases military might',
    image: '/images/republic-day-parade-2026.jpg',
    slug: 'republic-day-2026-parade-military'
  },
  {
    id: 'photo-top-5',
    title: 'Djokovic wins 25th Grand Slam at Australian Open',
    image: '/images/djokovic-australian-open-trophy.jpg',
    slug: 'djokovic-25th-grand-slam-australian-open'
  },
  {
    id: 'photo-top-6',
    title: 'Indian designer stuns at Paris Fashion Week',
    image: '/images/paris-fashion-week-indian-designer.jpg',
    slug: 'indian-designer-paris-fashion-week-handloom'
  }
];

export const photosSectionData: SectionData = {
  sectionTitle: 'Photos',
  subCategories: photosSubCategories,
  mainNews: photosMainNews,
  topNews: photosTopNews
};