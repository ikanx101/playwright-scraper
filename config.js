/**
 * Configuration for the web scraper
 */
module.exports = {
    // Default scraper options
    defaultOptions: {
        outputDir: 'saved_pages',
        timeout: 40000,
        retryCount: 5,
        retryDelay: 6,
        concurrency: 8,
        headless: false
    },
    
    // URLs to scrape
    urls: [
	"https://dapo.kemendikdasmen.go.id/sp"
    ]
}; 
