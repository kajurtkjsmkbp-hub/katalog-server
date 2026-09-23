# LocalDash PRO

LocalDash PRO adalah dashboard katalog layanan IT lokal yang elegan, responsif, dan ringan. Didesain khusus untuk environment *Homelab* / Server Lokal (seperti Proxmox, TrueNAS, Raspberry Pi).

## Fitur Unggulan
*   **UI/UX Modern & Kustomisasi Penuh**: Mendukung Mode Terang/Gelap, Live Particle Background, kustomisasi ikon (FontAwesome), dan upload background kustom.
*   **Manajemen Drag & Drop**: Atur susunan kartu layanan dengan mudah (diotorisasi dengan Password Admin).
*   **Live Ping / Latency**: Mengecek status ketersediaan (Online/Offline) dan latensi (*Ping* dalam ms) setiap layanan secara real-time.
*   **System Monitor**: Menampilkan penggunaan CPU dan RAM dari host secara *live*.
*   **PWA Ready**: Dapat di-install layaknya aplikasi native (Progressive Web App) di Smartphone atau Desktop.
*   **Quick View Modal**: Buka layanan secara *picture-in-picture* tanpa perlu membuka tab browser baru.
*   **Backup & Restore**: Mudah mencadangkan atau mengembalikan konfigurasi seluruh dashboard dengan satu klik.

---

## Panduan Instalasi di Proxmox LXC

Panduan ini berasumsi Anda sudah membuat container LXC (Linux Container) berbasis **Debian/Ubuntu** di Proxmox. Disarankan menggunakan alokasi minimum: **1 Core CPU, 512MB RAM, dan 4GB Storage**.

### 1. Update Sistem dan Install Dependensi
Buka console LXC Anda di Proxmox, jalankan perintah berikut:
```bash
apt update && apt upgrade -y
apt install -y curl git build-essential
```

### 2. Install Node.js
Karena LocalDash dibangun di atas Node.js, kita perlu menginstalnya. Sangat disarankan menggunakan Node.js versi 18 atau 20 (LTS).
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```
Cek instalasi berhasil atau tidak dengan:
```bash
node -v
npm -v
```

### 3. Clone Repository LocalDash PRO
Kloning repositori ini ke dalam direktori `/opt` (atau direktori manapun yang Anda kehendaki):
```bash
cd /opt
git clone https://github.com/kajurtkjsmkbp-hub/katalog-server.git localdash
cd localdash
```

### 4. Install Dependensi Aplikasi
Gunakan `npm` untuk menginstal modul-modul yang dibutuhkan (express, multer, tcp-ping, dsb):
```bash
npm install
```

### 5. Konfigurasi File Awal
Salin *sample file* bawaan agar dashboard tidak kosong dan langsung dapat berjalan:
```bash
cp data.sample.json data.json
cp settings.sample.json settings.json
```

### 6. Menjalankan Aplikasi (Testing)
Sekarang Anda sudah bisa mencoba menjalankannya dengan perintah:
```bash
node server.js
```
*Aplikasi akan berjalan di port `3000`. Akses melalui browser: `http://<IP_LXC_ANDA>:3000`. (Password Default Admin: `admin123`)*

Gunakan `Ctrl + C` untuk mematikan server tes.

---

### 7. Menjalankan di Background secara Permanen dengan PM2
Agar dashboard tetap berjalan setelah kita menutup Console Proxmox, atau menyala otomatis saat server LXC restart, kita menggunakan **PM2**.

**Install PM2 secara global:**
```bash
npm install -g pm2
```

**Jalankan aplikasi dengan PM2:**
```bash
pm2 start server.js --name "localdash"
```

**Konfigurasi PM2 agar Autostart (Startup):**
```bash
pm2 startup
```
*PM2 akan mengeluarkan sebuah perintah yang harus Anda *copy-paste* dan jalankan. Setelah menjalankan perintah tersebut, simpan konfigurasi PM2:*
```bash
pm2 save
```

---

## Panduan Update Aplikasi

Jika ada pembaruan (update) terbaru di repositori GitHub, Anda dapat melakukan update tanpa takut kehilangan data layanan (`data.json` dan `settings.json`) yang sudah ada. Ikuti langkah-langkah berikut:

### 1. Masuk ke Direktori Aplikasi
Pastikan Anda berada di dalam folder instalasi aplikasi:
```bash
cd /opt/localdash
```

### 2. Tarik Pembaruan dari GitHub
Gunakan perintah `git pull` untuk mengambil kode terbaru dari repositori:
```bash
git pull origin main
```
*(Catatan: Sesuaikan `main` jika branch yang digunakan adalah `master`)*

### 3. Perbarui Dependensi (Jika Ada)
Mungkin ada modul Node.js baru yang ditambahkan di pembaruan. Jalankan kembali:
```bash
npm install
```

### 4. Restart Aplikasi
Jika Anda menjalankan aplikasi dengan PM2, cukup restart aplikasinya agar pembaruan bisa langsung diterapkan:
```bash
pm2 restart localdash
```

Dashboard kini berhasil diperbarui!

---

### Selesai! 🎉
LocalDash PRO kini sudah terpasang dan berjalan secara permanen (otomatis *startup*) di LXC Proxmox Anda!
