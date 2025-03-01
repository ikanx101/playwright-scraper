/**
 * Example showing how to use the scraper as a module with custom configuration
 */
const { runScraper } = require('../index');

// Custom URLs to scrape
const customUrls = [
    "https://www.tokopedia.com/search?st=&q=smartphone&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=",
    "https://www.tokopedia.com/search?st=&q=tablet&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource="
];

// Custom options
const customOptions = {
    outputDir: 'custom_output',
    concurrency: 2,
    headless: true,  // Run in headless mode
    timeout: 45000   // Longer timeout
};

// Run the scraper with custom configuration
(async () => {
    try {
        console.log("Starting custom scraper example...");
        const results = await runScraper(customUrls, customOptions);
        
        // Do something with the results
        console.log("Scraping completed. Results:");
        Object.entries(results).forEach(([url, filepath]) => {
            console.log(`- ${url}: ${filepath ? 'Success' : 'Failed'}`);
        });
    } catch (error) {
        console.error("Error in custom scraper example:", error);
    }
})(); 