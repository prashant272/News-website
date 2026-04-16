const axios = require("axios");
const Parser = require("rss-parser");
const newsSources = require("./Config/newsSources");

const parser = new Parser();

const repairXml = (xml) => {
    if (!xml) return xml;
    return xml.replace(/<([a-zA-Z0-9:]+)([^>]*?)\s([a-zA-Z0-9_\-]+)(\s|>)/g, '<$1$2 $3=""$4');
};

const testSources = async () => {
    console.log(`Starting test for ${newsSources.length} sources...`);
    const results = {
        success: [],
        failed: []
    };

    for (const source of newsSources) {
        try {
            const config = {
                headers: {
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    'Accept': 'application/xml, text/xml, */*'
                },
                timeout: 5000
            };

            const response = await axios.get(source.url, config);
            const cleanedXml = repairXml(response.data);
            const feed = await parser.parseString(cleanedXml);
            
            console.log(`✅ [SUCCESS] ${source.name} - ${feed.items.length} items`);
            results.success.push({ name: source.name, url: source.url });
        } catch (error) {
            console.log(`❌ [FAILED] ${source.name} (${source.url}) - Error: ${error.message}`);
            results.failed.push({ name: source.name, url: source.url, error: error.message });
        }
    }

    console.log("\n--- TEST SUMMARY ---");
    console.log(`Total: ${newsSources.length}`);
    console.log(`Success: ${results.success.length}`);
    console.log(`Failed: ${results.failed.length}`);
};

testSources();
