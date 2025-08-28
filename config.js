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
<<<<<<< HEAD
	"https://shopee.co.id/SiS-GO-Energy-Gel-Isotonic-60ml-Bstores-i.106955054.4522546469?sp_atk=6a4c3e5c-7794-42a5-b20e-fc08846a34ae&xptdk=6a4c3e5c-7794-42a5-b20e-fc08846a34ae"
=======
	'https://www.tokopedia.com/torch-id/product'
>>>>>>> 9adcbd22b1626f0a8c0e5f48922222808275d3cc
    ]
}; 
