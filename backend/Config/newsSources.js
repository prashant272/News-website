const newsSources = [
    // --- HOME (Top Stories) ---
    {
        name: "DD News - National",
        url: "https://ddnews.gov.in/rss/national",
        category: "home",
    },
    {
        name: "The Hindu - Front Page",
        url: "https://www.thehindu.com/feeder/default.rss",
        category: "home",
    },

    // --- INDIA (National) ---
    {
        name: "Press Information Bureau (PIB) - India",
        url: "https://news.google.com/rss/search?q=site:pib.gov.in+news",
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
        name: "Olympics - World Cup & Olympic",
        url: "https://news.google.com/rss/search?q=world+cup+olympic+site:olympics.com",
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
        name: "TechCrunch",
        url: "https://techcrunch.com/feed/",
        category: "technology",
    },
    {
        name: "The Verge",
        url: "https://www.theverge.com/rss/index.xml",
        category: "technology",
    },
    {
        name: "Wired",
        url: "https://www.wired.com/feed/rss",
        category: "technology",
    },

    // --- ENTERTAINMENT ---
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
        name: "ABC News - World",
        url: "https://abcnews.go.com/abcnews/internationalheadlines",
        category: "world",
    },
    {
        name: "Washington Post - World",
        url: "https://feeds.washingtonpost.com/rss/world",
        category: "world",
    },
    {
        name: "Russia News (TASS / RT / Global)",
        url: "https://news.google.com/rss/search?q=Russia+news",
        category: "world",
    },
    {
        name: "United Nations News",
        url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
        category: "world",
    },

    // --- HEALTH ---
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
];

module.exports = newsSources;
