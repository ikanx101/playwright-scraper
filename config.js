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
	'https://dapo.kemendikdasmen.go.id/sp/1/050000','https://dapo.kemendikdasmen.go.id/sp/1/020000','https://dapo.kemendikdasmen.go.id/sp/1/030000','https://dapo.kemendikdasmen.go.id/sp/1/070000','https://dapo.kemendikdasmen.go.id/sp/1/190000','https://dapo.kemendikdasmen.go.id/sp/1/280000','https://dapo.kemendikdasmen.go.id/sp/1/240000','https://dapo.kemendikdasmen.go.id/sp/1/120000','https://dapo.kemendikdasmen.go.id/sp/1/110000','https://dapo.kemendikdasmen.go.id/sp/1/060000','https://dapo.kemendikdasmen.go.id/sp/1/090000','https://dapo.kemendikdasmen.go.id/sp/1/230000','https://dapo.kemendikdasmen.go.id/sp/1/080000','https://dapo.kemendikdasmen.go.id/sp/1/130000','https://dapo.kemendikdasmen.go.id/sp/1/010000','https://dapo.kemendikdasmen.go.id/sp/1/150000','https://dapo.kemendikdasmen.go.id/sp/1/180000','https://dapo.kemendikdasmen.go.id/sp/1/040000','https://dapo.kemendikdasmen.go.id/sp/1/100000','https://dapo.kemendikdasmen.go.id/sp/1/140000','https://dapo.kemendikdasmen.go.id/sp/1/200000','https://dapo.kemendikdasmen.go.id/sp/1/170000','https://dapo.kemendikdasmen.go.id/sp/1/160000','https://dapo.kemendikdasmen.go.id/sp/1/220000','https://dapo.kemendikdasmen.go.id/sp/1/210000','https://dapo.kemendikdasmen.go.id/sp/1/260000','https://dapo.kemendikdasmen.go.id/sp/1/270000','https://dapo.kemendikdasmen.go.id/sp/1/330000','https://dapo.kemendikdasmen.go.id/sp/1/310000','https://dapo.kemendikdasmen.go.id/sp/1/300000','https://dapo.kemendikdasmen.go.id/sp/1/250000','https://dapo.kemendikdasmen.go.id/sp/1/290000','https://dapo.kemendikdasmen.go.id/sp/1/380000','https://dapo.kemendikdasmen.go.id/sp/1/340000','https://dapo.kemendikdasmen.go.id/sp/1/320000','https://dapo.kemendikdasmen.go.id/sp/1/360000','https://dapo.kemendikdasmen.go.id/sp/1/390000','https://dapo.kemendikdasmen.go.id/sp/1/370000','https://dapo.kemendikdasmen.go.id/sp/1/350000'
    ]
}; 
