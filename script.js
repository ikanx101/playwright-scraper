const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Fungsi untuk mendapatkan nama file yang aman dari URL
function getSafeFilename(url) {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    const pathname = parsedUrl.pathname.replace(/\//g, '_');
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
    return `${domain}${pathname}_${timestamp}.html`;
}

// Fungsi untuk memproses satu URL
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
                const filepath = path.join(outputDir, filename);
                fs.writeFileSync(filepath, content, 'utf8');

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

// Fungsi utama untuk menyimpan halaman web secara paralel
async function savePages(urls, options = {}) {
    // Menghitung waktu mulai
    const startTime = Date.now();
    
    // Default options dengan destructuring
    const {
        outputDir = 'saved_pages',
        timeout = 30000,
        retryCount = 3,
        retryDelay = 5,
        concurrency = 3  // Jumlah maksimum URL yang diproses secara bersamaan
    } = options;

    console.log("\n🌐 Membuka browser...");

    // Memastikan direktori output ada
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Membuat direktori output: ${outputDir}`);
    }

    // Menyimpan hasil dalam objek
    const results = {};
    
    // Membuka browser
    const browser = await chromium.launch({
        headless: false,
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

// Fungsi untuk scroll melalui halaman
async function scrollThroughPage(page, url = '') {
    // Pengaturan scroll
    const maxNoNewContent = 5;
    const maxScrollAttempts = 50;
    let scrollAttempts = 0;
    let noNewContentCount = 0;
    let lastContentHash = null;
    let lastDocumentHeight = 0;
    let consecutiveSameHeight = 0;
    let lastElementsCount = 0;

    // Memeriksa status loading
    const checkLoadingState = async () => {
        return page.evaluate(() => {
            // Memeriksa indikator loading umum
            const loaders = document.querySelectorAll(
                '.loading, .spinner, .loader, [aria-busy="true"], .infinite-scroll-component__outerdiv, ' +
                '.infinite-scroll-component, [data-testid="primaryColumn"] div[role="progressbar"], ' +
                'progress, .progress-bar, .loading-indicator, .ytd-continuation-item-renderer'
            );

            // Memeriksa indikator loading khusus YouTube
            const ytLoading = document.querySelectorAll('ytd-continuation-item-renderer, yt-next-continuation');

            const scrollPosition = window.scrollY + window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Memeriksa jumlah elemen di DOM
            const elementsCount = document.body.querySelectorAll('*').length;

            return {
                isLoading: loaders.length > 0 || ytLoading.length > 0,
                atBottom: scrollPosition >= documentHeight - 100,
                scrollPosition: scrollPosition,
                documentHeight: documentHeight,
                elementsCount: elementsCount
            };
        });
    };

    // Mendapatkan hash konten untuk perbandingan
    const getContentHash = async () => {
        return page.evaluate(() => {
            // Fokus pada area konten utama
            const contentAreas = document.querySelectorAll('main, article, #content, .content, [role="main"], .results, .feed, .timeline, .video-list, .search-results');
            if (contentAreas.length > 0) {
                return Array.from(contentAreas).map(el => el.innerText).join('');
            }
            // Fallback: mendapatkan teks dari seluruh dokumen
            return document.body.innerText;
        });
    };

    // Stabilisasi awal halaman
    await page.waitForTimeout(1000);

    // Mendapatkan status awal
    const initialState = await checkLoadingState();
    lastElementsCount = initialState.elementsCount;

    // Loop scroll
    while (noNewContentCount < maxNoNewContent && scrollAttempts < maxScrollAttempts) {
        scrollAttempts++;
        const viewportHeight = page.viewportSize().height;

        // Jumlah scroll yang lebih efisien untuk halaman panjang
        const scrollAmount = Math.floor(
            Math.random() * (viewportHeight * 1.2 - viewportHeight * 0.7) + viewportHeight * 0.7
        );

        // Scroll dengan perilaku halus
        await page.evaluate((scrollAmount) => {
            window.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        }, scrollAmount);

        // Waktu tunggu yang efisien
        const waitTime = Math.floor(300 + Math.random() * 200); // 300-500ms
        await page.waitForTimeout(waitTime);

        // Memeriksa status loading
        const loadingState = await checkLoadingState();

        // Mendeteksi perubahan tinggi dokumen
        if (loadingState.documentHeight === lastDocumentHeight) {
            consecutiveSameHeight++;
        } else {
            consecutiveSameHeight = 0;
            lastDocumentHeight = loadingState.documentHeight;
        }

        // Menunggu jika konten sedang dimuat
        if (loadingState.isLoading) {
            console.log(`[${url}] Indikator loading terdeteksi, menunggu...`);
            await page.waitForTimeout(Math.floor(Math.random() * 700) + 800);
        }

        // Memeriksa konten baru dengan beberapa metode
        const newContentHash = await getContentHash();
        const newLoadingState = await checkLoadingState();

        const contentChanged = newContentHash !== lastContentHash;
        const elementsChanged = newLoadingState.elementsCount !== lastElementsCount;
        const heightChanged = newLoadingState.documentHeight > loadingState.documentHeight + 20;

        if (contentChanged || elementsChanged || heightChanged) {
            noNewContentCount = 0;
            if (contentChanged) {
                console.log(`[${url}] Konten teks baru ditemukan (scroll ${scrollAttempts})`);
            }
            if (elementsChanged) {
                console.log(`[${url}] Elemen DOM berubah: ${lastElementsCount} → ${newLoadingState.elementsCount}`);
            }
            if (heightChanged) {
                console.log(`[${url}] Tinggi halaman bertambah menjadi ${newLoadingState.documentHeight}px`);
            }

            lastContentHash = newContentHash;
            lastElementsCount = newLoadingState.elementsCount;
        } else {
            noNewContentCount++;
            console.log(`[${url}] Tidak ada konten baru terdeteksi (${noNewContentCount}/${maxNoNewContent})`);
        }

        // Deteksi akhir halaman yang lebih akurat
        if (loadingState.atBottom && !loadingState.isLoading && consecutiveSameHeight >= 3) {
            console.log(`[${url}] Mencapai bagian bawah halaman pada posisi ${loadingState.scrollPosition}px dari ${loadingState.documentHeight}px`);
            // Menunggu sedikit lebih lama untuk memastikan tidak ada konten baru
            await page.waitForTimeout(1000);
            const finalCheck = await checkLoadingState();

            if (finalCheck.documentHeight <= loadingState.documentHeight + 20) {
                console.log(`[${url}] Tidak ada lagi konten yang dimuat, scroll selesai`);
                await page.waitForTimeout(1000);
                break;
            } else {
                console.log(`[${url}] Tinggi halaman masih bertambah, lanjutkan scroll`);
            }
        }

        // Simulasi pembacaan (terjadi dengan probabilitas 10%)
        if (Math.random() < 0.1 && scrollAttempts > 5) {
            const readPause = Math.floor(Math.random() * 500) + 300;
            console.log(`[${url}] Jeda sebentar selama ${readPause}ms`);
            await page.waitForTimeout(readPause);
        }

        // Simulasi scroll ke atas (terjadi dengan probabilitas 5%)
        if (Math.random() < 0.05 && scrollAttempts > 8) {
            const backAmount = Math.floor(Math.random() * (viewportHeight * 0.2 - viewportHeight * 0.1) + viewportHeight * 0.1);
            await page.evaluate((backAmount) => {
                window.scrollBy({
                    top: -backAmount,
                    behavior: 'smooth'
                });
            }, backAmount);
            await page.waitForTimeout(200);
        }
    }

    // Scroll ke bawah jika mencapai batas percobaan
    if (scrollAttempts >= maxScrollAttempts) {
        console.log(`[${url}] Mencapai batas percobaan scroll (${maxScrollAttempts}), memaksa scroll ke bawah`);
        await page.evaluate(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
        await page.waitForTimeout(1500);
    }

    console.log(`[${url}] Selesai scroll setelah ${scrollAttempts} operasi scroll`);
}

// URL yang akan di-scrape
const urls = [
    "https://www.tokopedia.com/search?st=&q=monitor&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=",
    "https://www.tokopedia.com/search?st=&q=laptop&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource=",
    "https://www.tokopedia.com/search?st=&q=keyboard&srp_component_id=02.01.00.00&srp_page_id=&srp_page_title=&navsource="
];

// Menjalankan scraper
(async () => {
    try {
        console.log("Memulai proses scraping paralel...");
        const results = await savePages(urls, {
            concurrency: 3  // Mengatur jumlah URL yang diproses secara bersamaan
        });
        console.log("Proses selesai!");
    } catch (error) {
        console.error("Error dalam proses utama:", error);
    }
})();