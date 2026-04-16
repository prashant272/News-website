const newsSources = [

    // --- INDIA (National) ---
    {
        name: "Aaj Tak - India",
        url: "https://www.aajtak.in/rssfeeds/?id=india",
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
        name: "The Hindu - National",
        url: "https://www.thehindu.com/news/national/feeder/default.rss",
        category: "india",
    },

    // --- SPORTS ---
    {
        name: "News18 Sports",
        url: "https://www.news18.com/rss/sports.xml",
        category: "sports",
    },
    {
        name: "Hindustan Times Cricket",
        url: "https://www.hindustantimes.com/rss/cricket/rssfeed.xml",
        category: "sports"
    },



    // --- BUSINESS ---
    {
        name: "CNN Business",
        url: "http://rss.cnn.com/rss/money_latest.rss",
        category: "business",
    },

    // --- TECHNOLOGY ---
    {
        name: "Gadgets360 - News",
        url: "https://www.gadgets360.com/rss/news",
        category: "technology",
    },
    {
        name: "Hindustan Times Tech",
        url: "https://www.hindustantimes.com/rss/tech/rssfeed.xml",
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
        name: "Reuters World",
        url: "https://www.reutersagency.com/feed/?best-topics=world-news&post_type=best",
        category: "world",
    },

    // --- HEALTH ---
    {
        name: "The HealthSite",
        url: "https://www.thehealthsite.com/feed/",
        category: "health",
    },
    {
        name: "World Health Organization (WHO)",
        url: "https://news.google.com/rss/search?q=site:who.int+health",
        category: "health",
    },

    // --- STATE NEWS (Regional) ---
    {
        name: "Live Hindustan - West Bengal",
        url: "https://api.livehindustan.com/feeds/rss/west-bengal/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Gujarat",
        url: "https://api.livehindustan.com/feeds/rss/gujarat/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Punjab",
        url: "https://api.livehindustan.com/feeds/rss/punjab/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Jharkhand",
        url: "https://api.livehindustan.com/feeds/rss/jharkhand/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Chhattisgarh",
        url: "https://api.livehindustan.com/feeds/rss/chhattisgarh/rssfeed.xml",
        category: "state",
    },
    {
        name: "Telangana Today",
        url: "https://telanganatoday.com/feed",
        category: "state",
    },
    {
        name: "The Hindu - AP",
        url: "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
        category: "state",
    },
    {
        name: "Onmanorama - Kerala",
        url: "https://www.onmanorama.com/rss/news/kerala.xml",
        category: "state",
    },
    {
        name: "Amar Ujala - Bihar",
        url: "https://www.amarujala.com/rss/bihar.xml",
        category: "state",
        state: "bihar"
    },
    {
        name: "Bihar - Live Hindustan",
        url: "https://api.livehindustan.com/feeds/rss/bihar/rssfeed.xml",
        category: "state",
        state: "bihar"
    },
    {
        name: "UP - Live Hindustan",
        url: "https://api.livehindustan.com/feeds/rss/uttar-pradesh/rssfeed.xml",
        category: "state",
        state: "uttar-pradesh"
    },
    // --- EDUCATION ---
    {
        name: "India Today Education",
        url: "https://www.indiatoday.in/rss/1206550",
        category: "education",
    },
    // --- SPECIAL CATEGORIES ---
    {
        name: "Live Mint - Business",
        url: "https://www.livemint.com/rss/companies",
        category: "business",
    },
    {
        name: "Moneycontrol Latest",
        url: "https://www.moneycontrol.com/rss/latestnews.xml",
        category: "business",
    },
    {
        name: "Live Hindustan Business",
        url: "https://api.livehindustan.com/feeds/rss/business/rssfeed.xml",
        category: "business",
    },

    {
        name: "PIB Hindi",
        url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3",
        category: "governance",
    },
    {
        name: "Live Hindustan Career",
        url: "https://api.livehindustan.com/feeds/rss/career/rssfeed.xml",
        category: "careers",
    },
    {
        name: "Amar Ujala Jobs",
        url: "https://www.amarujala.com/rss/jobs.xml",
        category: "careers",
    },
];

module.exports = newsSources;
