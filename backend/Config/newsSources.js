const newsSources = [
    // --- HOME (Top Stories) ---
    {
        name: "Aaj Tak",
        url: "https://www.aajtak.in/rssfeeds/?id=home",
        category: "home",
    },
    {
        name: "ABP News",
        url: "https://www.abplive.com/home/feed",
        category: "home",
    },
    {
        name: "The Hindu - Front Page",
        url: "https://www.thehindu.com/feeder/default.rss",
        category: "home",
    },

    // --- INDIA (National) ---
    {
        name: "Aaj Tak - India",
        url: "https://www.aajtak.in/rssfeeds/?id=india",
        category: "india",
    },
    {
        name: "ABP News - India",
        url: "https://www.abplive.com/news/india/feed",
        category: "india",
    },
    {
        name: "Zee News India",
        url: "https://zeenews.india.com/rss/india-national-news.xml",
        category: "india",
    },
    {
        name: "India TV News",
        url: "https://www.indiatvnews.com/rssnews/topstory.xml",
        category: "india",
    },
    {
        name: "NDTV India News",
        url: "https://feeds.feedburner.com/ndtvnews-india-news",
        category: "india",
    },
    {
        name: "News18 India",
        url: "https://www.news18.com/rss/india.xml",
        category: "india",
    },
    {
        name: "The Hindu - National",
        url: "https://www.thehindu.com/news/national/feeder/default.rss",
        category: "india",
    },

    // --- SPORTS ---
    {
        name: "Cricbuzz - Cricket News",
        url: "https://news.google.com/rss/search?q=cricket+bcci+icc+ipl+site:cricbuzz.com",
        category: "sports",
    },
    {
        name: "ESPN Sports News",
        url: "https://www.espn.com/espn/rss/news",
        category: "sports",
    },
    {
        name: "News18 Sports",
        url: "https://www.news18.com/rss/sports.xml",
        category: "sports",
    },


    // --- BUSINESS ---
    {
        name: "CNN Business",
        url: "http://rss.cnn.com/rss/money_latest.rss",
        category: "business",
    },
    {
        name: "Government Business News",
        url: "https://news.google.com/rss/search?q=government+business+finance+news",
        category: "business",
    },
    {
        name: "Ministry of Finance - India",
        url: "https://news.google.com/rss/search?q=site:finmin.nic.in+news",
        category: "business",
    },

    // --- TECHNOLOGY ---
    {
        name: "Gadgets360 - News",
        url: "https://www.gadgets360.com/rss/news",
        category: "technology",
    },
    {
        name: "HT Tech",
        url: "https://tech.hindustantimes.com/rss/tech",
        category: "technology",
    },
    {
        name: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        category: "technology",
    },
    {
        name: "The Verge",
        url: "https://www.theverge.com/rss/index.xml",
        category: "technology",
    },

    // --- ENTERTAINMENT ---
    {
        name: "Pinkvilla",
        url: "https://www.pinkvilla.com/rss.xml",
        category: "entertainment",
    },
    {
        name: "Bollywood Hungama",
        url: "https://www.bollywoodhungama.com/rss/news.xml",
        category: "entertainment",
    },
    {
        name: "Variety",
        url: "https://variety.com/feed/",
        category: "entertainment",
    },
    {
        name: "The Hollywood Reporter",
        url: "https://www.hollywoodreporter.com/feed/",
        category: "entertainment",
    },

    // --- LIFESTYLE ---
    {
        name: "Femina Lifestyle",
        url: "http://www.femina.in/feeds/feeds-lifestyle.xml",
        category: "lifestyle",
    },
    {
        name: "HT Lifestyle",
        url: "https://www.hindustantimes.com/rss/lifestyle/rssfeed.xml",
        category: "lifestyle",
    },
    {
        name: "Vogue",
        url: "https://www.vogue.com/feed/rss",
        category: "lifestyle",
    },
    {
        name: "GQ",
        url: "https://www.gq.com/feed/rss",
        category: "lifestyle",
    },

    // --- WORLD ---
    {
        name: "Al Jazeera All",
        url: "https://www.aljazeera.com/xml/rss/all.xml",
        category: "world",
    },
    {
        name: "BBC News - World",
        url: "http://feeds.bbci.co.uk/news/world/rss.xml",
        category: "world",
    },
    {
        name: "CNN - World",
        url: "https://rss.cnn.com/rss/edition_world.rss",
        category: "world",
    },
    {
        name: "The Guardian - World",
        url: "https://www.theguardian.com/world/rss",
        category: "world",
    },
    {
        name: "United Nations News",
        url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
        category: "world",
    },

    // --- HEALTH ---
    {
        name: "The HealthSite",
        url: "https://www.thehealthsite.com/feed/",
        category: "health",
    },
    {
        name: "ABP News - Health",
        url: "https://news.abplive.com/lifestyle/health/feed",
        category: "health",
    },
    {
        name: "World Health Organization (WHO)",
        url: "https://news.google.com/rss/search?q=site:who.int+health",
        category: "health",
    },
    {
        name: "WebMD",
        url: "https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC",
        category: "health",
    },
    {
        name: "National Institutes of Health (NIH)",
        url: "https://www.nih.gov/news-events/news-releases/rss.xml",
        category: "health",
    },
    // --- STATE NEWS (Regional) ---
    {
        name: "ABP News - Bihar",
        url: "https://www.abplive.com/news/bihar/feed",
        category: "state",
    },
    {
        name: "ABP News - Uttar Pradesh",
        url: "https://www.abplive.com/news/uttar-pradesh/feed",
        category: "state",
    },
    {
        name: "ABP News - Maharashtra",
        url: "https://www.abplive.com/news/maharashtra/feed",
        category: "state",
    },
    {
        name: "ABP News - Rajasthan",
        url: "https://www.abplive.com/news/rajasthan/feed",
        category: "state",
    },
    {
        name: "Live Hindustan - Bihar",
        url: "https://www.livehindustan.com/bihar/rss/",
        category: "state",
    },
    {
        name: "Live Hindustan - UP",
        url: "https://www.livehindustan.com/uttar-pradesh/rss/",
        category: "state",
    },
    {
        name: "Times of India - Karnataka",
        url: "https://timesofindia.indiatimes.com/rssfeeds/-2128833038.cms",
        category: "state",
    },
    {
        name: "Times of India - Tamil Nadu",
        url: "https://timesofindia.indiatimes.com/rssfeeds/4450010.cms",
        category: "state",
    },
    {
        name: "Telangana Today",
        url: "https://telanganatoday.com/feed",
        category: "state",
    },
    {
        name: "The Hindu - Andhra Pradesh",
        url: "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
        category: "state",
    },
    {
        name: "Onmanorama - Kerala",
        url: "https://www.onmanorama.com/rss/news/kerala.xml",
        category: "state",
    },
];

module.exports = newsSources;
