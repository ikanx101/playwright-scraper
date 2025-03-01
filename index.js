const { savePages } = require('./scraper/batchProcessor');
const config = require('./config');

/**
 * Main function to run the scraper
 * @param {Array<string>} urls - URLs to scrape
 * @param {Object} options - Scraper options
 */
async function runScraper(urls = config.urls, options = {}) {
    try {
        console.log("🚀 Memulai proses scraping paralel...");
        
        // Merge default options with provided options
        const mergedOptions = { ...config.defaultOptions, ...options };
        
        // Run the scraper
        const results = await savePages(urls, mergedOptions);
        
        console.log("✨ Proses selesai!");
        return results;
    } catch (error) {
        console.error("❌ Error dalam proses utama:", error);
        throw error;
    }
}

// If this file is run directly (not imported)
if (require.main === module) {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};
    
    // Simple command line argument parsing
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--concurrency' && i + 1 < args.length) {
            options.concurrency = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--headless') {
            options.headless = true;
        } else if (args[i] === '--output' && i + 1 < args.length) {
            options.outputDir = args[i + 1];
            i++;
        }
    }
    
    // Run the scraper
    runScraper(config.urls, options).catch(err => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}

module.exports = {
    runScraper
}; 