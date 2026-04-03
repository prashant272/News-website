// app/data/newsData.ts

export interface LatestNewsItem {
  id: string | number;
  category: string;
  title: string;
  image: string;
  slug: string;
  date?: string;
}

// LATEST INDIA NEWS
export const latestIndiaNews: LatestNewsItem[] = [
  {
    id: 'india-1',
    category: 'Maharashtra',
    title: "'Mein toh shapath lene wala hun': Old video of Ajit Pawar's remarks during press meet goes viral",
    image: '/images/ajit-pawar-viral-video.jpg',
    slug: 'ajit-pawar-old-video-viral',
    date: '1 hour ago'
  },
  {
    id: 'india-2',
    category: 'India',
    title: "'Runway was not in sight...': Crew to ATC moments before Ajit Pawar's plane crashed in Baramati",
    image: '/images/ajit-pawar-plane-crash-atc.jpg',
    slug: 'ajit-pawar-plane-crash-atc-conversation',
    date: '2 hours ago'
  },
  {
    id: 'india-3',
    category: 'Delhi',
    title: 'Delhi air quality improves to moderate category after heavy rainfall, AQI drops to 180',
    image: '/images/delhi-air-quality-rain.jpg',
    slug: 'delhi-air-quality-improves-rain',
    date: '3 hours ago'
  },
  {
    id: 'india-4',
    category: 'National',
    title: 'Budget 2026 LIVE: Finance Minister announces major tax relief for middle class families',
    image: '/images/budget-2026-fm-announcement.jpg',
    slug: 'budget-2026-tax-relief-middle-class',
    date: '4 hours ago'
  },
  {
    id: 'india-5',
    category: 'Karnataka',
    title: 'Bengaluru tech hub expands: 50 new startups receive government funding under Startup India',
    image: '/images/bengaluru-startups-funding.jpg',
    slug: 'bengaluru-startups-government-funding',
    date: '5 hours ago'
  },
  {
    id: 'india-6',
    category: 'Education',
    title: 'JEE Main 2026 tentative cutoff: Check category-wise cut off percentile for IITs',
    image: '/images/jee-main-2026-cutoff.jpg',
    slug: 'jee-main-2026-cutoff-percentile',
    date: '6 hours ago'
  },
  {
    id: 'india-7',
    category: 'Mumbai',
    title: 'PM Modi inaugurates new Mumbai Metro line connecting western suburbs to business district',
    image: '/images/mumbai-metro-inauguration.jpg',
    slug: 'mumbai-metro-line-inauguration',
    date: '7 hours ago'
  },
  {
    id: 'india-8',
    category: 'Kashmir',
    title: 'Jammu and Kashmir sees record tourist arrivals in January 2026, crosses 2 lakh mark',
    image: '/images/kashmir-tourism-record.jpg',
    slug: 'kashmir-record-tourist-arrivals',
    date: '8 hours ago'
  },
  {
    id: 'india-9',
    category: 'National',
    title: 'Supreme Court verdict on electoral bonds: Full judgment and key observations released',
    image: '/images/supreme-court-electoral-bonds.jpg',
    slug: 'supreme-court-electoral-bonds-verdict',
    date: '9 hours ago'
  },
  {
    id: 'india-10',
    category: 'Uttar Pradesh',
    title: 'Ayodhya Ram Mandir completes one year: Over 5 crore devotees visited in first year',
    image: '/images/ayodhya-ram-mandir-anniversary.jpg',
    slug: 'ayodhya-ram-mandir-one-year-devotees',
    date: '10 hours ago'
  },
  {
    id: 'india-11',
    category: 'Punjab',
    title: 'Farmers protest 2.0: Punjab and Haryana farmers march to Delhi demanding MSP guarantee',
    image: '/images/farmers-protest-delhi-msp.jpg',
    slug: 'farmers-protest-delhi-msp-guarantee',
    date: 'Yesterday'
  },
  {
    id: 'india-12',
    category: 'Gujarat',
    title: 'Gujarat GIFT City becomes Asia\'s fastest growing financial hub, attracts global banks',
    image: '/images/gift-city-gujarat-financial.jpg',
    slug: 'gift-city-gujarat-financial-hub',
    date: 'Yesterday'
  },
];

// LATEST WORLD NEWS
export const latestWorldNews: LatestNewsItem[] = [
  {
    id: 'world-1',
    category: 'USA',
    title: 'Donald Trump announces major policy changes in first week as 47th US President',
    image: '/images/trump-policy-changes.jpg',
    slug: 'trump-policy-changes-first-week',
    date: '1 hour ago'
  },
  {
    id: 'world-2',
    category: 'Europe',
    title: 'Russia-Ukraine peace talks resume in Geneva, both sides express optimism for ceasefire',
    image: '/images/russia-ukraine-peace-talks.jpg',
    slug: 'russia-ukraine-peace-talks-geneva',
    date: '2 hours ago'
  },
  {
    id: 'world-3',
    category: 'Middle East',
    title: 'Israel-Gaza conflict: UN Security Council passes resolution for immediate humanitarian aid',
    image: '/images/israel-gaza-un-resolution.jpg',
    slug: 'israel-gaza-un-humanitarian-aid',
    date: '3 hours ago'
  },
  {
    id: 'world-4',
    category: 'Asia Pacific',
    title: 'China launches new space station module, invites international astronauts for collaboration',
    image: '/images/china-space-station-launch.jpg',
    slug: 'china-space-station-international',
    date: '4 hours ago'
  },
  {
    id: 'world-5',
    category: 'Europe',
    title: 'UK economy shows recovery: GDP growth exceeds expectations in Q4 2025',
    image: '/images/uk-economy-gdp-growth.jpg',
    slug: 'uk-economy-gdp-growth-q4',
    date: '5 hours ago'
  },
  {
    id: 'world-6',
    category: 'Climate',
    title: 'Climate summit in Paris: World leaders commit to net-zero emissions by 2040',
    image: '/images/climate-summit-paris-2026.jpg',
    slug: 'climate-summit-paris-net-zero',
    date: '6 hours ago'
  },
  {
    id: 'world-7',
    category: 'Asia Pacific',
    title: 'Japan unveils bullet train capable of 400 km/h speed, connects Tokyo to Osaka in 1 hour',
    image: '/images/japan-bullet-train-400kmph.jpg',
    slug: 'japan-bullet-train-400-kmph',
    date: '7 hours ago'
  },
  {
    id: 'world-8',
    category: 'Europe',
    title: 'NATO Summit 2026: Alliance members pledge increased defense spending amid tensions',
    image: '/images/nato-summit-2026-defense.jpg',
    slug: 'nato-summit-defense-spending',
    date: '8 hours ago'
  },
  {
    id: 'world-9',
    category: 'Africa',
    title: 'South Africa elections 2026: ANC faces biggest challenge in three decades',
    image: '/images/south-africa-elections-anc.jpg',
    slug: 'south-africa-elections-anc-challenge',
    date: '9 hours ago'
  },
  {
    id: 'world-10',
    category: 'Latin America',
    title: 'Brazil announces major initiative to combat Amazon deforestation with $10B fund',
    image: '/images/brazil-amazon-deforestation.jpg',
    slug: 'brazil-amazon-deforestation-initiative',
    date: '10 hours ago'
  },
  {
    id: 'world-11',
    category: 'Australia',
    title: 'Australia battles worst bushfire season in decade, thousands evacuated from Sydney',
    image: '/images/australia-bushfires-sydney.jpg',
    slug: 'australia-bushfires-evacuation',
    date: 'Yesterday'
  },
  {
    id: 'world-12',
    category: 'Middle East',
    title: 'Saudi Arabia announces Vision 2040: Ambitious plan to diversify economy beyond oil',
    image: '/images/saudi-vision-2040-economy.jpg',
    slug: 'saudi-vision-2040-economic-plan',
    date: 'Yesterday'
  },
];

// LATEST TECHNOLOGY NEWS
export const latestTechnologyNews: LatestNewsItem[] = [
  {
    id: 'tech-1',
    category: 'Technology',
    title: 'Amazon may have accidentally sent layoff alert to AWS staff: Up to 16,000 jobs at risk',
    image: '/images/amazon-aws-layoffs.jpg',
    slug: 'amazon-aws-layoff-alert-16000-jobs',
    date: '1 hour ago'
  },
  {
    id: 'tech-2',
    category: 'AI',
    title: 'OpenAI unveils GPT-5: Most advanced AI model with reasoning capabilities',
    image: '/images/openai-gpt-5-launch.jpg',
    slug: 'openai-gpt-5-launch-features',
    date: '2 hours ago'
  },
  {
    id: 'tech-3',
    category: 'Smartphones',
    title: 'Google Pixel 9 Pro launched in India with advanced AI photography at Rs 89,999',
    image: '/images/google-pixel-9-pro-india.jpg',
    slug: 'google-pixel-9-pro-india-launch',
    date: '3 hours ago'
  },
  {
    id: 'tech-4',
    category: 'Technology',
    title: 'Google improves AI search experience by making AI overviews and AI mode more seamless',
    image: '/images/google-ai-search-improvement.jpg',
    slug: 'google-ai-search-overviews-seamless',
    date: '4 hours ago'
  },
  {
    id: 'tech-5',
    category: 'Electric Vehicles',
    title: 'Tesla Cybertruck gets major update: New features and $10,000 price reduction',
    image: '/images/tesla-cybertruck-update.jpg',
    slug: 'tesla-cybertruck-update-price-cut',
    date: '5 hours ago'
  },
  {
    id: 'tech-6',
    category: 'VR/AR',
    title: 'Apple Vision Pro 2 coming to India in March 2026, pre-orders start February 1',
    image: '/images/apple-vision-pro-2-india.jpg',
    slug: 'apple-vision-pro-2-india-launch',
    date: '6 hours ago'
  },
  {
    id: 'tech-7',
    category: 'Computing',
    title: 'IBM unveils 1000-qubit quantum computer, breakthrough in computing power',
    image: '/images/ibm-quantum-computer-1000.jpg',
    slug: 'ibm-quantum-computer-1000-qubit',
    date: '7 hours ago'
  },
  {
    id: 'tech-8',
    category: 'Apps',
    title: 'YouTube launches AI-powered video editing tools for creators worldwide',
    image: '/images/youtube-ai-editing-tools.jpg',
    slug: 'youtube-ai-video-editing-tools',
    date: '8 hours ago'
  },
  {
    id: 'tech-9',
    category: 'Gaming',
    title: 'PlayStation 6 announcement: Sony reveals next-gen console coming Holiday 2027',
    image: '/images/playstation-6-announcement.jpg',
    slug: 'playstation-6-announcement-2027',
    date: '9 hours ago'
  },
  {
    id: 'tech-10',
    category: 'Cybersecurity',
    title: 'Major data breach affects 500 million users: Tech companies rush to patch vulnerability',
    image: '/images/data-breach-500-million.jpg',
    slug: 'data-breach-500-million-users',
    date: '10 hours ago'
  },
  {
    id: 'tech-11',
    category: 'Space',
    title: 'SpaceX Starship completes successful orbital flight, Mars mission timeline announced',
    image: '/images/spacex-starship-orbital-success.jpg',
    slug: 'spacex-starship-orbital-flight-mars',
    date: 'Yesterday'
  },
  {
    id: 'tech-12',
    category: 'AI',
    title: 'Microsoft integrates GPT-5 into Office 365, revolutionizing workplace productivity',
    image: '/images/microsoft-gpt5-office365.jpg',
    slug: 'microsoft-gpt5-office-365-integration',
    date: 'Yesterday'
  },
];

// LATEST BUSINESS NEWS
export const latestBusinessNews: LatestNewsItem[] = [
  {
    id: 'business-1',
    category: 'Business',
    title: '115% return in 1 year: Stock under Rs 50 gains amid rally in stock market, check details',
    image: '/images/stock-market-rally-returns.jpg',
    slug: 'stock-under-50-gains-115-percent',
    date: '1 hour ago'
  },
  {
    id: 'business-2',
    category: 'Markets',
    title: 'Sensex crosses 85,000 mark for first time, Nifty at record high driven by IT stocks',
    image: '/images/sensex-85000-nifty-record.jpg',
    slug: 'sensex-85000-nifty-record-high',
    date: '2 hours ago'
  },
  {
    id: 'business-3',
    category: 'Banking',
    title: 'RBI keeps repo rate unchanged at 6.5%, focuses on inflation control measures',
    image: '/images/rbi-repo-rate-unchanged.jpg',
    slug: 'rbi-repo-rate-unchanged-inflation',
    date: '3 hours ago'
  },
  {
    id: 'business-4',
    category: 'Startups',
    title: 'Indian startups raise $12 billion in 2025, highest funding year since 2021',
    image: '/images/indian-startups-funding-2025.jpg',
    slug: 'indian-startups-funding-2025-record',
    date: '4 hours ago'
  },
  {
    id: 'business-5',
    category: 'Telecom',
    title: 'Reliance Jio announces nationwide 5G rollout completion, aims for 6G by 2030',
    image: '/images/reliance-jio-5g-rollout.jpg',
    slug: 'reliance-jio-5g-rollout-6g-plans',
    date: '5 hours ago'
  },
  {
    id: 'business-6',
    category: 'Currency',
    title: 'Rupee strengthens to 82 per dollar, strongest level in 6 months',
    image: '/images/rupee-dollar-exchange-rate.jpg',
    slug: 'rupee-strengthens-82-dollar',
    date: '6 hours ago'
  },
  {
    id: 'business-7',
    category: 'IPO',
    title: 'Swiggy IPO opens today: Check price band, lot size, and analyst recommendations',
    image: '/images/swiggy-ipo-details.jpg',
    slug: 'swiggy-ipo-price-band-lot-size',
    date: '7 hours ago'
  },
  {
    id: 'business-8',
    category: 'Real Estate',
    title: 'Property prices surge 25% in top 7 cities, Mumbai leads with 30% YoY growth',
    image: '/images/property-prices-surge-cities.jpg',
    slug: 'property-prices-surge-25-percent',
    date: '8 hours ago'
  },
  {
    id: 'business-9',
    category: 'Commodities',
    title: 'Gold prices surge to all-time high of Rs 1,80,000 per 10 grams amid uncertainty',
    image: '/images/gold-prices-all-time-high.jpg',
    slug: 'gold-prices-all-time-high-180000',
    date: '9 hours ago'
  },
  {
    id: 'business-10',
    category: 'Automobile',
    title: 'Tata Motors launches 3 new electric vehicles, targets 50% EV sales by 2027',
    image: '/images/tata-motors-new-ev-launch.jpg',
    slug: 'tata-motors-new-ev-launch-2027',
    date: '10 hours ago'
  },
  {
    id: 'business-11',
    category: 'Crypto',
    title: 'Bitcoin crosses $100,000 mark, cryptocurrency market cap reaches $3 trillion',
    image: '/images/bitcoin-100k-crypto-market.jpg',
    slug: 'bitcoin-100k-crypto-market-3-trillion',
    date: 'Yesterday'
  },
  {
    id: 'business-12',
    category: 'Economy',
    title: 'India GDP growth projected at 7.5% for FY26, highest among major economies',
    image: '/images/india-gdp-growth-fy26.jpg',
    slug: 'india-gdp-growth-75-percent-fy26',
    date: 'Yesterday'
  },
];

// LATEST ENTERTAINMENT NEWS
export const latestEntertainmentNews: LatestNewsItem[] = [
  {
    id: 'ent-1',
    category: 'Entertainment',
    title: "Here's why Reddit users think Arijit Singh's retirement is more of a 'rebellion'",
    image: '/images/arijit-singh-retirement-reddit.jpg',
    slug: 'arijit-singh-retirement-rebellion',
    date: '1 hour ago'
  },
  {
    id: 'ent-2',
    category: 'Entertainment',
    title: "Karan Wahi breaks silence on wedding rumours with Dil Mill Gaye co-star Jennifer Winget: 'Free ki...'",
    image: '/images/karan-wahi-jennifer-winget-wedding.jpg',
    slug: 'karan-wahi-jennifer-winget-wedding-rumours',
    date: '2 hours ago'
  },
  {
    id: 'ent-3',
    category: 'Entertainment',
    title: 'Karan Wahi-Jennifer Winget shows: From Dill Mill Gaye to Raisinghani vs Raisinghani',
    image: '/images/karan-wahi-jennifer-winget-shows.jpg',
    slug: 'karan-wahi-jennifer-winget-shows',
    date: '3 hours ago'
  },
  {
    id: 'ent-4',
    category: 'Bollywood',
    title: 'Shah Rukh Khan announces new film with Rajkumar Hirani, shooting starts in March 2026',
    image: '/images/srk-rajkumar-hirani-film.jpg',
    slug: 'srk-rajkumar-hirani-new-film',
    date: '4 hours ago'
  },
  {
    id: 'ent-5',
    category: 'Music',
    title: 'AR Rahman collaborates with Coldplay for India tour anthem, releases February 1',
    image: '/images/ar-rahman-coldplay-collaboration.jpg',
    slug: 'ar-rahman-coldplay-india-tour-anthem',
    date: '5 hours ago'
  },
  {
    id: 'ent-6',
    category: 'OTT',
    title: 'Netflix announces 15 new Indian originals for 2026, including Mirzapur Season 4',
    image: '/images/netflix-indian-originals-2026.jpg',
    slug: 'netflix-indian-originals-mirzapur-4',
    date: '6 hours ago'
  },
  {
    id: 'ent-7',
    category: 'Bollywood',
    title: 'Alia Bhatt and Ranbir Kapoor welcome second child, announce on social media',
    image: '/images/alia-ranbir-second-child.jpg',
    slug: 'alia-ranbir-second-child-announcement',
    date: '7 hours ago'
  },
  {
    id: 'ent-8',
    category: 'Awards',
    title: 'Oscar nominations 2026: Indian film enters final 5 in Best International Feature',
    image: '/images/oscar-nominations-indian-film.jpg',
    slug: 'oscar-nominations-2026-indian-film',
    date: '8 hours ago'
  },
  {
    id: 'ent-9',
    category: 'Television',
    title: 'Kapil Sharma Show returns with new season, special guest appearances announced',
    image: '/images/kapil-sharma-show-new-season.jpg',
    slug: 'kapil-sharma-show-new-season-guests',
    date: '9 hours ago'
  },
  {
    id: 'ent-10',
    category: 'Bollywood',
    title: 'Salman Khan and Katrina Kaif reunite for Tiger 4, release date announced',
    image: '/images/salman-katrina-tiger-4.jpg',
    slug: 'salman-katrina-tiger-4-announcement',
    date: '10 hours ago'
  },
  {
    id: 'ent-11',
    category: 'Hollywood',
    title: 'Avengers: Secret Wars trailer released, fans go crazy over shocking reveals',
    image: '/images/avengers-secret-wars-trailer.jpg',
    slug: 'avengers-secret-wars-trailer-reveals',
    date: 'Yesterday'
  },
  {
    id: 'ent-12',
    category: 'Music',
    title: 'Taylor Swift announces India tour 2026: Mumbai and Delhi concerts confirmed',
    image: '/images/taylor-swift-india-tour-2026.jpg',
    slug: 'taylor-swift-india-tour-mumbai-delhi',
    date: 'Yesterday'
  },
];

// LATEST SPORTS NEWS
export const latestSportsNews: LatestNewsItem[] = [
  {
    id: 'sports-1',
    category: 'Cricket',
    title: 'India vs Australia 5th Test: Virat Kohli scores century, India in commanding position',
    image: '/images/india-australia-test-kohli.jpg',
    slug: 'india-australia-5th-test-kohli-century',
    date: '1 hour ago'
  },
  {
    id: 'sports-2',
    category: 'Tennis',
    title: 'Novak Djokovic wins 25th Grand Slam at Australian Open 2026, breaks all records',
    image: '/images/djokovic-australian-open-25th.jpg',
    slug: 'djokovic-australian-open-25th-grand-slam',
    date: '2 hours ago'
  },
  {
    id: 'sports-3',
    category: 'IPL',
    title: 'IPL 2026 Mega Auction: Mumbai Indians spend Rs 25 crore on young batting sensation',
    image: '/images/ipl-2026-mega-auction.jpg',
    slug: 'ipl-2026-mega-auction-records',
    date: '3 hours ago'
  },
  {
    id: 'sports-4',
    category: 'Athletics',
    title: 'Neeraj Chopra breaks world record with 92.15m throw at Diamond League',
    image: '/images/neeraj-chopra-world-record.jpg',
    slug: 'neeraj-chopra-world-record-diamond-league',
    date: '4 hours ago'
  },
  {
    id: 'sports-5',
    category: 'Football',
    title: 'FIFA World Cup 2026: India qualifies for first time, nation celebrates historic moment',
    image: '/images/fifa-world-cup-india-qualifies.jpg',
    slug: 'fifa-world-cup-2026-india-qualifies',
    date: '5 hours ago'
  },
  {
    id: 'sports-6',
    category: 'Badminton',
    title: 'PV Sindhu wins All England Championship, third major title of the year',
    image: '/images/pv-sindhu-all-england.jpg',
    slug: 'pv-sindhu-all-england-championship-win',
    date: '6 hours ago'
  },
  {
    id: 'sports-7',
    category: 'Cricket',
    title: 'Rohit Sharma announces retirement from Test cricket after Australia series',
    image: '/images/rohit-sharma-test-retirement.jpg',
    slug: 'rohit-sharma-test-retirement',
    date: '7 hours ago'
  },
  {
    id: 'sports-8',
    category: 'Football',
    title: 'Real Madrid signs Indian footballer for Rs 50 crore, historic deal for Indian football',
    image: '/images/indian-footballer-real-madrid.jpg',
    slug: 'indian-footballer-real-madrid-signing',
    date: '8 hours ago'
  },
  {
    id: 'sports-9',
    category: 'Olympics',
    title: 'Paris Olympics 2028: India announces 300-member contingent, targets 25 medals',
    image: '/images/paris-olympics-india-contingent.jpg',
    slug: 'paris-olympics-2028-india-contingent',
    date: '9 hours ago'
  },
  {
    id: 'sports-10',
    category: 'Cricket',
    title: 'MS Dhoni makes sensational comeback to international cricket at age 44',
    image: '/images/ms-dhoni-comeback.jpg',
    slug: 'ms-dhoni-international-comeback-44',
    date: '10 hours ago'
  },
  {
    id: 'sports-11',
    category: 'Wrestling',
    title: 'Indian wrestlers win 5 gold medals at World Championships, best ever performance',
    image: '/images/indian-wrestlers-world-championships.jpg',
    slug: 'indian-wrestlers-5-gold-world-championships',
    date: 'Yesterday'
  },
  {
    id: 'sports-12',
    category: 'Hockey',
    title: 'India wins Hockey World Cup 2026, defeats Australia in thrilling final',
    image: '/images/india-hockey-world-cup-2026.jpg',
    slug: 'india-hockey-world-cup-2026-win',
    date: 'Yesterday'
  },
];

// LATEST LIFESTYLE NEWS
export const latestLifestyleNews: LatestNewsItem[] = [
  {
    id: 'lifestyle-1',
    category: 'Wellness',
    title: "Analog living becomes 2026's biggest lifestyle shift: People ditch quick commerce for mindful shopping",
    image: '/images/analog-living-trend-2026.jpg',
    slug: 'analog-living-lifestyle-shift-mindful-shopping',
    date: '1 hour ago'
  },
  {
    id: 'lifestyle-2',
    category: 'Fashion',
    title: 'India sets global fashion trends in 2026: Festive fusion wear dominates international runways',
    image: '/images/india-fashion-trends-global.jpg',
    slug: 'india-fashion-trends-global-fusion-wear',
    date: '2 hours ago'
  },
  {
    id: 'lifestyle-3',
    category: 'Health & Fitness',
    title: 'Brain wealth over brain health: Cognitive longevity becomes top wellness priority for 2026',
    image: '/images/brain-wealth-cognitive-longevity.jpg',
    slug: 'brain-wealth-cognitive-longevity-wellness',
    date: '3 hours ago'
  },
  {
    id: 'lifestyle-4',
    category: 'Travel',
    title: 'Sound healing tourism takes over: Luxury hotels install vibroacoustic therapy beds worth Rs 10 lakh',
    image: '/images/sound-healing-tourism-hotels.jpg',
    slug: 'sound-healing-tourism-vibroacoustic-therapy',
    date: '4 hours ago'
  },
  {
    id: 'lifestyle-5',
    category: 'Wellness',
    title: 'Dry January goes mainstream in India: 32% millennials pledge alcohol-free month for health reset',
    image: '/images/dry-january-india-alcohol-free.jpg',
    slug: 'dry-january-india-alcohol-free-trend',
    date: '5 hours ago'
  },
  {
    id: 'lifestyle-6',
    category: 'Beauty',
    title: 'Weight-loss injections boom: 1.6 million Indians use Ozempic, Mounjaro for wellness goals',
    image: '/images/ozempic-mounjaro-weight-loss-india.jpg',
    slug: 'ozempic-mounjaro-weight-loss-india-boom',
    date: '6 hours ago'
  },
  {
    id: 'lifestyle-7',
    category: 'Travel',
    title: 'Cool-cations replace beach holidays: Alpine wellness retreats see 400% booking surge',
    image: '/images/cool-cations-alpine-wellness-retreats.jpg',
    slug: 'cool-cations-alpine-wellness-retreat-trend',
    date: '7 hours ago'
  },
  {
    id: 'lifestyle-8',
    category: 'Fashion',
    title: 'Sustainable fashion becomes mandatory: Government introduces eco-certification for clothing brands',
    image: '/images/sustainable-fashion-eco-certification.jpg',
    slug: 'sustainable-fashion-eco-certification-mandatory',
    date: '8 hours ago'
  },
  {
    id: 'lifestyle-9',
    category: 'Food',
    title: 'Proffee trend explodes: Protein coffee becomes Rs 500 crore market in India',
    image: '/images/proffee-protein-coffee-market.jpg',
    slug: 'proffee-protein-coffee-market-india',
    date: '9 hours ago'
  },
  {
    id: 'lifestyle-10',
    category: 'Wellness',
    title: 'AI fitness coaches replace gym trainers: 5 million Indians switch to personalized digital workouts',
    image: '/images/ai-fitness-coaches-digital-workouts.jpg',
    slug: 'ai-fitness-coaches-personalized-workouts',
    date: '10 hours ago'
  },
  {
    id: 'lifestyle-11',
    category: 'Travel',
    title: 'Forest bathing retreats in Uttarakhand booked till December: Shinrin-yoku therapy gains popularity',
    image: '/images/forest-bathing-uttarakhand-shinrin-yoku.jpg',
    slug: 'forest-bathing-uttarakhand-shinrin-yoku-therapy',
    date: 'Yesterday'
  },
  {
    id: 'lifestyle-12',
    category: 'Health & Fitness',
    title: 'Walking pad craze hits India: Under-desk treadmills sell out within hours of restocking',
    image: '/images/walking-pad-treadmill-india-sold-out.jpg',
    slug: 'walking-pad-under-desk-treadmill-sold-out',
    date: 'Yesterday'
  },
];

// LATEST HEALTH NEWS
export const latestHealthNews: LatestNewsItem[] = [
  {
    id: 'health-1',
    category: 'Medical Research',
    title: 'Cancer breakthrough: Menin inhibitors approved for 40% of AML cases, survival rates double in trials',
    image: '/images/menin-inhibitors-aml-breakthrough.jpg',
    slug: 'menin-inhibitors-aml-survival-rates-double',
    date: '1 hour ago'
  },
  {
    id: 'health-2',
    category: 'Wellness',
    title: 'GLP-1 medications boom: 1 in 8 Indians use Ozempic, Mounjaro as government slashes prices to Rs 4,000',
    image: '/images/glp1-ozempic-price-slash-india.jpg',
    slug: 'glp1-ozempic-price-slash-4000-rupees',
    date: '2 hours ago'
  },
  {
    id: 'health-3',
    category: 'Digital Health',
    title: 'AI diagnostic tools deployed in 500 Indian hospitals: Disease detection 30% faster, 95% accuracy rate',
    image: '/images/ai-diagnostic-500-hospitals-india.jpg',
    slug: 'ai-diagnostic-500-hospitals-95-percent-accuracy',
    date: '3 hours ago'
  },
  {
    id: 'health-4',
    category: 'Policy',
    title: 'Budget 2026 healthcare allocation: Rs 1 lakh crore for preventive care, NCD screening for adults 30+',
    image: '/images/budget-2026-preventive-care-1-lakh-crore.jpg',
    slug: 'budget-2026-preventive-care-ncd-screening',
    date: '4 hours ago'
  },
  {
    id: 'health-5',
    category: 'Mental Health',
    title: 'National suicide prevention helpline launched: 24/7 support in 12 languages, toll-free across India',
    image: '/images/suicide-prevention-helpline-12-languages.jpg',
    slug: 'suicide-prevention-helpline-24-7-india',
    date: '5 hours ago'
  },
  {
    id: 'health-6',
    category: 'Digital Health',
    title: 'Ayushman Bharat Digital Mission hits 500 million: Universal health ID rollout by December 2026',
    image: '/images/ayushman-bharat-500-million-health-id.jpg',
    slug: 'ayushman-bharat-500-million-universal-health-id',
    date: '6 hours ago'
  },
  {
    id: 'health-7',
    category: 'Medical Research',
    title: 'Pancreatic cancer RAS inhibitor shows 60% survival improvement in phase III clinical trial',
    image: '/images/pancreatic-ras-inhibitor-60-percent.jpg',
    slug: 'pancreatic-ras-inhibitor-60-percent-survival',
    date: '7 hours ago'
  },
  {
    id: 'health-8',
    category: 'Disease Prevention',
    title: 'AIIMS diabetes reversal program: Free 12-week intensive lifestyle intervention shows 70% success rate',
    image: '/images/aiims-diabetes-reversal-70-percent.jpg',
    slug: 'aiims-diabetes-reversal-70-percent-success',
    date: '8 hours ago'
  },
  {
    id: 'health-9',
    category: 'Digital Health',
    title: 'Telemedicine consultations cross 100 million: Indians prefer online doctors, saves Rs 500 per visit',
    image: '/images/telemedicine-100-million-consultations.jpg',
    slug: 'telemedicine-100-million-consultations-india',
    date: '9 hours ago'
  },
  {
    id: 'health-10',
    category: 'Disease Prevention',
    title: 'Tuberculosis cases drop 40%: India on track to eliminate TB by 2030, WHO praises efforts',
    image: '/images/tuberculosis-40-percent-drop-india-2030.jpg',
    slug: 'tuberculosis-40-percent-drop-eliminate-2030',
    date: '10 hours ago'
  },
];

// Helper function to get all news
export function getAllNewsData(): LatestNewsItem[] {
  return [
    ...latestSportsNews,
    ...latestIndiaNews,
    ...latestWorldNews,
    ...latestBusinessNews,
    ...latestTechnologyNews,
    ...latestEntertainmentNews,
    ...latestLifestyleNews,
    ...latestHealthNews
  ];
}

// Helper function to get news by category
export function getNewsByCategory(category: string): LatestNewsItem[] {
  return getAllNewsData().filter(item => {
    if (Array.isArray(item.category)) {
      return item.category.some(cat => cat.toLowerCase() === category.toLowerCase());
    }
    return item.category?.toLowerCase() === category.toLowerCase();
  });
}

// Helper function to get news by section
export function getNewsBySection(section: string): LatestNewsItem[] {
  const sectionMap: Record<string, LatestNewsItem[]> = {
    'sports': latestSportsNews,
    'india': latestIndiaNews,
    'world': latestWorldNews,
    'business': latestBusinessNews,
    'technology': latestTechnologyNews,
    'entertainment': latestEntertainmentNews,
    'lifestyle': latestLifestyleNews,
    'health': latestHealthNews
  };
  
  return sectionMap[section.toLowerCase()] || [];
}
