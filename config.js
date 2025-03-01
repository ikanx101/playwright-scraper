/**
 * Configuration for the web scraper
 */
module.exports = {
    // Default scraper options
    defaultOptions: {
        outputDir: 'saved_pages',
        timeout: 30000,
        retryCount: 3,
        retryDelay: 5,
        concurrency: 3,
        headless: false
    },
    
    // URLs to scrape
    urls: [
        "https://www.tokopedia.com/search?st=&q=monitor&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=",
        "https://www.tokopedia.com/search?st=&q=laptop&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=",
        "https://www.tokopedia.com/search?st=&q=keyboard&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource="
    ]
}; 