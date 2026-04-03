const axios = require('axios');
const newsSources = require('./backend/Config/newsSources');

async function testFeeds() {
    console.log("🔍 Testing RSS Feeds...");
    const results = [];
    
    for (const source of newsSources) {
        try {
            const resp = await axios.get(source.url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(`✅ [OK] ${source.name}`);
            results.push({ name: source.name, status: 'OK', url: source.url });
        } catch (err) {
            console.log(`❌ [FAIL] ${source.name} - Error: ${err.message}`);
            results.push({ name: source.name, status: 'FAIL', url: source.url, error: err.message });
        }
    }
    
    console.log("\n--- SUMMARY ---");
    const failed = results.filter(r => r.status === 'FAIL');
    console.log(`Total: ${results.length}, Success: ${results.length - failed.length}, Failed: ${failed.length}`);
    failed.forEach(f => console.log(`- ${f.name} (${f.error})`));
}

testFeeds();
