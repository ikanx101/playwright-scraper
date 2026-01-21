/**
 * Configuration for the web scraper
 */
module.exports = {
    // Default scraper options
    defaultOptions: {
        outputDir: 'saved_pages',
        timeout: 50000,
        retryCount: 10,
        retryDelay: 10,
        concurrency: 5,
        headless: false
    },
    
    // URLs to scrape
    urls: [
'https://www.google.com/maps/place/Nasi+Bebek+Ayam+Bakar+Madu+Podo+Moro/data=!4m7!3m6!1s0x2e698b300d1ed537:0x5ac25b9ed24e307b!8m2!3d-6.1846665!4d106.9234795!16s%2Fg%2F1pzx4nsx_!19sChIJN9UeDTCLaS4RezBO0p5bwlo?authuser=0&hl=id&rclk=1'
	]
}; 
