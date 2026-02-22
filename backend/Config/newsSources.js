const newsSources = [
    // --- HOME (Top Stories) ---
    {
        name: "NDTV - Top Stories",
        url: "https://feeds.feedburner.com/ndtvnews-top-stories",
        category: "home",
    },
    {
        name: "Hindustan Times - Top News",
        url: "https://www.hindustantimes.com/feeds/rss/news/rssfeed.xml",
        category: "home",
    },
    {
        name: "Zee News - India", // Good for home/national mix
        url: "https://zeenews.india.com/rss/india-national-news.xml",
        category: "home",
    },

    // --- INDIA (National) ---
    {
        name: "India Today - India",
        url: "https://www.indiatoday.in/rss/1206584",
        category: "india",
    },
    {
        name: "The Hindu - National",
        url: "https://www.thehindu.com/news/national/feeder/default.rss",
        category: "india",
    },
    {
        name: "Zee News - India",
        url: "https://zeenews.india.com/rss/india-national-news.xml",
        category: "india",
    },

    // --- SPORTS ---
    {
        name: "Indian Express - Sports",
        url: "https://indianexpress.com/section/sports/feed/",
        category: "sports",
    },
    {
        name: "NDTV Sports",
        url: "https://feeds.feedburner.com/ndtvsports-latest",
        category: "sports",
    },
    {
        name: "Zee News - Sports",
        url: "https://zeenews.india.com/rss/sports-news.xml",
        category: "sports",
    },
    {
        name: "Zee News - Cricket",
        url: "https://zeenews.india.com/rss/cricket-news.xml",
        category: "sports",
    },

    // --- BUSINESS ---
    {
        name: "Economic Times - Business",
        url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms",
        category: "business",
    },
    {
        name: "LiveMint",
        url: "https://www.livemint.com/rss/news",
        category: "business",
    },
    {
        name: "Zee News - Business",
        url: "https://zeenews.india.com/rss/business-news.xml",
        category: "business",
    },

    // --- TECHNOLOGY ---
    {
        name: "News18 - Tech",
        url: "https://www.news18.com/commonfeeds/v1/cne/rss/tech.xml",
        category: "technology",
    },
    {
        name: "Gadgets 360",
        url: "https://gadgets360.com/rss/feeds",
        category: "technology",
    },
    {
        name: "Zee News - Technology",
        url: "https://zeenews.india.com/rss/technology-news.xml",
        category: "technology",
    },

    // --- ENTERTAINMENT ---
    {
        name: "Bollywood Hungama",
        url: "https://www.bollywoodhungama.com/rss/news.xml",
        category: "entertainment",
    },
    {
        name: "Hindustan Times - Entertainment",
        url: "https://www.hindustantimes.com/feeds/rss/entertainment/bollywood/rssfeed.xml",
        category: "entertainment",
    },
    {
        name: "Zee News - Entertainment",
        url: "https://zeenews.india.com/rss/entertainment-news.xml",
        category: "entertainment",
    },

    // --- LIFESTYLE ---
    {
        name: "NDTV - Lifestyle", // Verify if this works, otherwise use specific
        url: "https://feeds.feedburner.com/ndtvlifestyle-latest",
        category: "lifestyle",
    },
    {
        name: "Hindustan Times - Lifestyle",
        url: "https://www.hindustantimes.com/feeds/rss/lifestyle/rssfeed.xml",
        category: "lifestyle",
    },
    {
        name: "Zee News - Lifestyle",
        url: "https://zeenews.india.com/rss/lifestyle-news.xml",
        category: "lifestyle",
    },
    {
        name: "News18 - Lifestyle",
        url: "https://www.news18.com/commonfeeds/v1/en/lifestyle.xml",
        category: "lifestyle",
    },

    // --- WORLD ---
    {
        name: "Firstpost - World",
        url: "https://www.firstpost.com/rss/world.xml",
        category: "world",
    },
    {
        name: "Zee News - World",
        url: "https://zeenews.india.com/rss/world-news.xml",
        category: "world",
    },
    {
        name: "CNBC TV18 - World",
        url: "https://www.cnbctv18.com/commonfeeds/v1/cne/rss/world.xml",
        category: "world",
    },

    // --- HEALTH ---
    {
        name: "NDTV - Health",
        url: "https://feeds.feedburner.com/ndtvcooks-latest",
        category: "health",
    },
    {
        name: "Hindustan Times - Health",
        url: "https://www.hindustantimes.com/feeds/rss/lifestyle/health/rssfeed.xml",
        category: "health",
    },
    {
        name: "News18 - Health",
        url: "https://www.news18.com/commonfeeds/v1/en/health-and-fitness.xml",
        category: "health",
    },

    // ============================================================
    // --- REGIONAL: UTTAR PRADESH ---
    // ============================================================
    {
        name: "News18 UP Uttarakhand",
        url: "https://hindi.news18.com/commonfeeds/v1/hin/rss/uttar-pradesh.xml",
        category: "regional",
    },
    {
        name: "Zee News - UP Uttarakhand",
        url: "https://zeenews.india.com/hindi/india/up-uttarakhand/feed",
        category: "regional",
    },
    {
        name: "Amar Ujala - UP",
        url: "https://www.amarujala.com/rss/uttar-pradesh.xml",
        category: "regional",
    },
    {
        name: "Dainik Jagran - UP",
        url: "https://www.jagran.com/rss/uttar-pradesh.xml",
        category: "regional",
    },
    {
        name: "Bharat Samachar",
        url: "https://www.bharatsamachar.com/rssFeed/top-stories",
        category: "regional",
    },
    {
        name: "India News UP (TV9 Bharatvarsh)",
        url: "https://tv9hindi.com/feed",
        category: "regional",
    },

    // ============================================================
    // --- REGIONAL: MUMBAI / MAHARASHTRA ---
    // ============================================================
    {
        name: "ABP Majha (ABP Live Marathi)",
        url: "https://marathi.abplive.com/feed",
        category: "regional",
    },
    {
        name: "TV9 Marathi",
        url: "https://tv9marathi.com/feed",
        category: "regional",
    },
    {
        name: "Zee 24 Taas",
        url: "https://zeenews.india.com/marathi/feed",
        category: "regional",
    },
    {
        name: "Mumbai Tak",
        url: "https://www.indiatv.in/hindi/rss/feed",
        category: "regional",
    },
    {
        name: "Maharashtra Times",
        url: "https://maharashtratimes.com/rssfeedstopstories.cms",
        category: "regional",
    },

    // ============================================================
    // --- REGIONAL: BANGALORE / KARNATAKA ---
    // ============================================================
    {
        name: "TV9 Kannada",
        url: "https://tv9kannada.com/feed",
        category: "regional",
    },
    {
        name: "Suvarna News (TV9 Network)",
        url: "https://kannada.tv9.com/feed",
        category: "regional",
    },
    {
        name: "Vijaya Karnataka",
        url: "https://vijaykarnataka.com/rssfeedstopstories.cms",
        category: "regional",
    },
    {
        name: "Udayavani - Karnataka",
        url: "https://www.udayavani.com/rss-feed",
        category: "regional",
    },

    // ============================================================
    // --- REGIONAL: BIHAR / JHARKHAND ---
    // ============================================================
    {
        name: "News18 Bihar Jharkhand",
        url: "https://hindi.news18.com/commonfeeds/v1/hin/rss/bihar.xml",
        category: "regional",
    },
    {
        name: "Zee Bihar Jharkhand",
        url: "https://zeenews.india.com/hindi/india/bihar-and-jharkhand/feed",
        category: "regional",
    },
    {
        name: "Dainik Bhaskar - Bihar",
        url: "https://www.bhaskar.com/rss-feed/796/",
        category: "regional",
    },
    {
        name: "Prabhat Khabar - Bihar",
        url: "https://www.prabhatkhabar.com/feed",
        category: "regional",
    },

    // ============================================================
    // --- REGIONAL: DELHI / NCR ---
    // ============================================================
    {
        name: "NDTV 24x7 - Delhi",
        url: "https://feeds.feedburner.com/ndtvnews-delhi-news",
        category: "regional",
    },
    {
        name: "TV9 Bharatvarsh - National",
        url: "https://tv9hindi.com/feed",
        category: "regional",
    },
    {
        name: "Hindustan - Delhi",
        url: "https://www.livehindustan.com/rss/delhi.xml",
        category: "regional",
    },
    {
        name: "Navbharat Times - Delhi",
        url: "https://navbharattimes.indiatimes.com/rssfeedstopstories.cms",
        category: "regional",
    },
];

module.exports = newsSources;
