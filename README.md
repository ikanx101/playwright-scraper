# Modular Web Scraper

Scraper web modular dengan kemampuan paralel untuk menyimpan halaman web secara lengkap, termasuk konten dinamis yang dimuat saat scroll.

## Fitur

- ✅ Pemrosesan paralel untuk multiple URL
- ✅ Struktur modular untuk kemudahan pemeliharaan
- ✅ Scroll otomatis untuk memuat konten dinamis
- ✅ Retry otomatis jika terjadi error
- ✅ Konfigurasi yang fleksibel
- ✅ Dapat digunakan sebagai modul atau aplikasi mandiri

## Struktur Proyek

```
.
├── config.js                 # Konfigurasi default
├── index.js                  # Entry point utama
├── utils/                    # Utilitas umum
│   ├── fileUtils.js          # Fungsi terkait file
│   └── scrollUtils.js        # Fungsi terkait scroll
├── scraper/                  # Komponen scraper
│   ├── pageProcessor.js      # Pemrosesan satu halaman
│   └── batchProcessor.js     # Pemrosesan batch URL
└── examples/                 # Contoh penggunaan
    └── customScraper.js      # Contoh penggunaan kustom
```

## Instalasi

```bash
# Clone repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
npm install
```

## Penggunaan

### Menjalankan Scraper

```bash
# Menjalankan dengan konfigurasi default
node index.js

# Menjalankan dengan opsi kustom
node index.js --concurrency 2 --headless --output custom_output
```

### Opsi Command Line

- `--concurrency <number>`: Jumlah URL yang diproses secara bersamaan
- `--headless`: Menjalankan browser dalam mode headless (tanpa UI)
- `--output <directory>`: Direktori untuk menyimpan hasil

### Menggunakan sebagai Modul

```javascript
const { runScraper } = require('./index');

// URLs yang akan di-scrape
const urls = [
    "https://www.example.com/page1",
    "https://www.example.com/page2"
];

// Opsi kustom
const options = {
    outputDir: 'custom_output',
    concurrency: 2,
    headless: true
};

// Menjalankan scraper
(async () => {
    try {
        const results = await runScraper(urls, options);
        console.log("Hasil:", results);
    } catch (error) {
        console.error("Error:", error);
    }
})();
```

## Konfigurasi

Anda dapat mengubah konfigurasi default di file `config.js`:

```javascript
module.exports = {
    defaultOptions: {
        outputDir: 'saved_pages',
        timeout: 30000,
        retryCount: 3,
        retryDelay: 5,
        concurrency: 3,
        headless: false
    },
    urls: [
        // URLs default untuk di-scrape
    ]
};
```

## Opsi Konfigurasi

| Opsi | Deskripsi | Default |
|------|-----------|---------|
| `outputDir` | Direktori untuk menyimpan hasil | `'saved_pages'` |
| `timeout` | Timeout untuk navigasi halaman (ms) | `30000` |
| `retryCount` | Jumlah percobaan ulang jika gagal | `3` |
| `retryDelay` | Delay antara percobaan ulang (detik) | `5` |
| `concurrency` | Jumlah URL yang diproses bersamaan | `3` |
| `headless` | Mode browser (headless atau tidak) | `false` |

## Lisensi

MIT 