const { chromium } = require('playwright');
const { ensureDirectoryExists } = require('../utils/fileUtils');
const { processUrl } = require('./pageProcessor');

/**
 * Processes multiple URLs in parallel batches
 * @param {Array<string>} urls - Array of URLs to process
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Results of processing
 */
async function savePages(urls, options = {}) {
    // Menghitung waktu mulai
    const startTime = Date.now();
    
    // Default options dengan destructuring
    const {
        outputDir = 'saved_pages',
        timeout = 30000,
        retryCount = 3,
        retryDelay = 5,
        concurrency = 3,  // Jumlah maksimum URL yang diproses secara bersamaan
        headless = false  // Mode browser
    } = options;

    console.log("\n🌐 Membuka browser...");

    // Memastikan direktori output ada
    ensureDirectoryExists(outputDir);

    // Menyimpan hasil dalam objek
    const results = {};
    
    // Membuka browser
    const browser = await chromium.launch({
        headless,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    try {
        const totalUrls = urls.length;
        console.log(`🔄 Memproses ${totalUrls} URL dengan konkurensi ${concurrency}`);

        // Memproses URL dalam batch untuk mengontrol konkurensi
        for (let i = 0; i < totalUrls; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            console.log(`\n📦 Memproses batch ${Math.floor(i/concurrency) + 1}/${Math.ceil(totalUrls/concurrency)}`);
            
            // Memproses batch URL secara paralel
            const batchResults = await Promise.all(
                batch.map(url => processUrl(url, browser, {
                    outputDir,
                    timeout,
                    retryCount,
                    retryDelay
                }))
            );
            
            // Menyimpan hasil batch
            batchResults.forEach(({ url, result }) => {
                results[url] = result;
            });
        }

    } finally {
        // Menutup browser
        try {
            console.log("\n🔒 Menutup browser...");
            await browser.close();

            // Mencetak ringkasan
            const successCount = Object.values(results).filter(path => path !== null).length;
            const failedCount = urls.length - successCount;
            const duration = (Date.now() - startTime) / 1000;

            console.log("\n📊 Ringkasan:");
            console.log(`├─ Total URL: ${urls.length}`);
            console.log(`├─ Berhasil: ${successCount}`);
            console.log(`├─ Gagal: ${failedCount}`);
            console.log(`└─ Durasi: ${duration.toFixed(2)} detik`);

        } catch (e) {
            console.log(`❌ Error saat menutup browser: ${e}`);
        }
    }

    return results;
}

module.exports = {
    savePages
}; 