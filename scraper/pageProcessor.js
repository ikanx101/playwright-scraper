const { scrollThroughPage } = require('../utils/scrollUtils');
const { getSafeFilename, saveToFile } = require('../utils/fileUtils');

/**
 * Processes a single URL
 * @param {string} url - The URL to process
 * @param {Object} browser - Playwright browser instance
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Result of processing
 */
async function processUrl(url, browser, options) {
    const {
        outputDir = 'saved_pages',
        timeout = 30000,
        retryCount = 3,
        retryDelay = 5
    } = options;

    console.log(`\n🔍 Memproses: ${url}`);
    
    // Membuat konteks browser baru untuk setiap URL
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        ignoreHTTPSErrors: true
    });
    
    let success = false;
    let attempts = 0;
    let result = null;
    
    try {
        // Mencoba mengakses URL dengan percobaan ulang jika gagal
        while (!success && attempts < retryCount) {
            attempts++;
            let page = null;

            try {
                console.log(`[${url}] Percobaan ${attempts}/${retryCount}...`);

                // Membuat halaman baru
                page = await context.newPage();
                page.setDefaultNavigationTimeout(timeout);
                page.setDefaultTimeout(timeout);

                // Menangani dialog secara otomatis
                page.on('dialog', dialog => dialog.dismiss());

                // Membuka URL
                console.log(`[${url}] Membuka URL...`);
                const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

                // Memeriksa respons
                if (!response) {
                    console.log(`[${url}] Tidak ada respons`);
                    throw new Error("No response");
                }

                if (response.status() >= 400) {
                    console.log(`[${url}] Kode status error: ${response.status()}`);
                    throw new Error(`Status code error: ${response.status()}`);
                }

                // Menunggu stabilisasi halaman
                console.log(`[${url}] Menunggu stabilisasi...`);
                await page.waitForTimeout(2000);

                // Melakukan scroll halaman
                console.log(`[${url}] Melakukan scroll halaman...`);
                await scrollThroughPage(page, url);

                // Memastikan semua konten telah dimuat
                console.log(`[${url}] Memastikan semua konten dimuat...`);
                await page.waitForTimeout(1000);

                // Kembali ke bagian atas halaman
                console.log(`[${url}] Scroll kembali ke atas...`);
                await page.evaluate('window.scrollTo({top: 0, behavior: "smooth"})');
                await page.waitForTimeout(500);

                // Mengambil konten HTML
                console.log(`[${url}] Mengambil konten HTML...`);
                const content = await page.content();

                // Menyimpan halaman ke file
                const filename = getSafeFilename(url);
                const filepath = saveToFile(content, outputDir, filename);

                console.log(`[${url}] ✅ Berhasil menyimpan ke ${filepath}`);
                result = filepath;
                success = true;

            } catch (e) {
                console.log(`[${url}] ❌ Error: ${e}`);
                if (attempts < retryCount) {
                    const delay = retryDelay * attempts;
                    console.log(`[${url}] Mencoba lagi dalam ${delay} detik...`);
                    await new Promise(resolve => setTimeout(resolve, delay * 1000));
                }
            } finally {
                // Menutup halaman
                if (page) {
                    console.log(`[${url}] Menutup halaman...`);
                    try {
                        await page.close();
                    } catch (e) {
                        console.log(`[${url}] Error saat menutup halaman: ${e}`);
                    }
                }
            }
        }

        // Menangani kegagalan setelah semua percobaan
        if (!success) {
            console.log(`[${url}] ❌ Gagal setelah ${retryCount} percobaan`);
        }
    } finally {
        // Menutup konteks browser
        await context.close();
    }
    
    return { url, result };
}

module.exports = {
    processUrl
}; 