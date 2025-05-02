# Modular Web Scraper

Scraper web modular dengan kemampuan paralel untuk menyimpan halaman web secara lengkap, termasuk konten dinamis yang dimuat saat scroll.

_Credit to: Mas Apriandito_.

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

# Update nodejs to the lates version
sudo npm cache clean -f
sudo npm install -g n
sudo n stable

# Install dependencies
npm install

# install playwright
npx playwright install-deps
npx playwright install

# Clone repository
git clone <repository-url>
cd <repository-directory>
```

## Penggunaan

### Menjalankan Scraper

```bash
# Menjalankan dengan konfigurasi default
node index.js --headless

# berjalan pake head
xvfb-run node index.js

# Menjalankan dengan opsi kustom
node index.js --concurrency 2 --headless --output custom_output
```

### Opsi Command Line

- `--concurrency <number>`: Jumlah URL yang diproses secara bersamaan
- `--headless`: Menjalankan browser dalam mode headless (tanpa UI)
- `--output <directory>`: Direktori untuk menyimpan hasil

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
