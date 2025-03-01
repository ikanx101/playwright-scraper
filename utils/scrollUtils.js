/**
 * Scrolls through a page to load all dynamic content
 * @param {Object} page - Playwright page object
 * @param {string} url - URL being processed (for logging)
 * @returns {Promise<void>}
 */
async function scrollThroughPage(page, url = '') {
    // Pengaturan scroll
    const maxNoNewContent = 5;
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
    while (noNewContentCount < maxNoNewContent) {
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
                console.log(`[${url}] Konten teks baru ditemukan`);
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
        if (Math.random() < 0.1 && noNewContentCount > 5) {
            const readPause = Math.floor(Math.random() * 500) + 300;
            console.log(`[${url}] Jeda sebentar selama ${readPause}ms`);
            await page.waitForTimeout(readPause);
        }

        // Simulasi scroll ke atas (terjadi dengan probabilitas 5%)
        if (Math.random() < 0.05 && noNewContentCount > 8) {
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

    console.log(`[${url}] Selesai scroll`);
}

module.exports = {
    scrollThroughPage
}; 