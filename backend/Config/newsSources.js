const newsSources = [
 
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
    },,
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
        name: "Live Hindustan - Odisha",
        url: "https://api.livehindustan.com/feeds/rss/odisha/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Jammu & Kashmir",
        url: "https://api.livehindustan.com/feeds/rss/jammu-and-kashmir/rssfeed.xml",
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
        name: "Live Hindustan - Haryana",
        url: "https://api.livehindustan.com/feeds/rss/haryana/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Himachal Pradesh",
        url: "https://api.livehindustan.com/feeds/rss/himachal-pradesh/rssfeed.xml",
        category: "state",
    },
    {
        name: "Live Hindustan - Uttarakhand",
        url: "https://api.livehindustan.com/feeds/rss/uttarakhand/rssfeed.xml",
        category: "state",
    },
    {
        name: "Times of India - Delhi",
        url: "https://timesofindia.indiatimes.com/rssfeeds/-2128830821.cms",
        category: "state",
    },
    {
        name: "Times of India - Mumbai",
        url: "https://timesofindia.indiatimes.com/rssfeeds/-2128833038.cms",
        category: "state",
    },
    {
        name: "Times of India - Hyderabad",
        url: "https://timesofindia.indiatimes.com/rssfeeds/4118245.rss",
        category: "state",
    },
    {
        name: "Times of India - Chennai",
        url: "https://timesofindia.indiatimes.com/rssfeeds/4450010.cms",
        category: "state",
    },
    // --- AMAR UJALA (Additional Regional) ---
    {
        name: "Amar Ujala - Uttar Pradesh",
        url: "https://www.amarujala.com/rss/uttar-pradesh.xml",
        category: "state",
        state: "uttar-pradesh"
    },
    {
        name: "Amar Ujala - Bihar",
        url: "https://www.amarujala.com/rss/bihar.xml",
        category: "state",
        state: "bihar"
    },
    {
        name: "Amar Ujala - Haryana",
        url: "https://www.amarujala.com/rss/haryana.xml",
        category: "state",
        state: "haryana"
    },
    {
        name: "Amar Ujala - Uttarakhand",
        url: "https://www.amarujala.com/rss/uttarakhand.xml",
        category: "state",
        state: "uttarakhand"
    },
    // --- TAK LIVE (Aaj Tak Group) ---
    {
        name: "UP Tak",
        url: "https://www.tak.live/rss/up-tak.xml",
        category: "state",
        state: "uttar-pradesh"
    },
    {
        name: "Bihar Tak",
        url: "https://www.tak.live/rss/bihar-tak.xml",
        category: "state",
        state: "bihar"
    },
    {
        name: "Rajasthan Tak",
        url: "https://www.tak.live/rss/rajasthan-tak.xml",
        category: "state",
        state: "rajasthan"
    },
    {
        name: "MP Tak",
        url: "https://www.tak.live/rss/mp-tak.xml",
        category: "state",
        state: "madhya-pradesh"
    },
    {
        name: "Haryana Tak",
        url: "https://www.tak.live/rss/haryana-tak.xml",
        category: "state",
        state: "haryana"
    },
    // --- EDUCATION & JOBS ---
    {
        name: "NDTV Education",
        url: "https://feeds.feedburner.com/ndtvnews-education",
        category: "education",
    },
    {
        name: "Jagran Josh - Education",
        url: "https://www.jagranjosh.com/rss/josh/general-knowledge.xml",
        category: "education",
    },
];

module.exports = newsSources;
