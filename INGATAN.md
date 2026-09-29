# 🧠 INGATAN PROYEK LOCALDASH PRO (MEMORY PERSISTENCE)
> **Catatan:** Dokumen ini adalah memori inti AI assistant (Antigravity). Setiap kali sesi dimulai ulang atau login kembali, dokumen ini berfungsi sebagai sumber kebenaran (*source of truth*) seluruh riwayat konteks proyek, preferensi pengguna, arsitektur teknis, dan fitur sistem.

---

## 📌 1. PROFIL PENGGUNA & PREFERENSI SISTEM
- **Bahasa Komunikasi:** Bahasa Indonesia (ramah, jelas, teknis, dan *to the point*).
- **Domain Proyek:** **LocalDash PRO** (Katalog & Dashboard Layanan Server IT Lokal / Homelab untuk Proxmox LXC, TrueNAS, Raspberry Pi, dll).
- **Lokasi Repositori:** `C:\Users\iphoenkz\Music\LMS-6Katalog`
- **Default Port:** `3000` (dapat dikonfigurasi via env `PORT`).
- **Prinsip Utama Aplikasi:**
  - Ringan, cepat, tanpa dependensi database berat (menggunakan berkas flat JSON: `data.json` & `settings.json`).
  - Responsif di berbagai perangkat (desktop, tablet, smartphone) dan siap PWA (*Progressive Web App*).
  - Status pemantauan layanan (*Live Ping / Latency*) berjalan *real-time* tanpa perlu me-refresh halaman browser.

---

## 🏗️ 2. ARSITEKTUR & STACK TEKNOLOGI
### Backend (Node.js & Express)
- **Runtime:** Node.js (v18 / v20 LTS recommended).
- **Framework:** Express.js (`cors`, `multer` untuk upload wallpaper background).
- **Penyimpanan:**
  - `data.json`: Menyimpan array kartu link/layanan (`id`, `name`, `url`, `category`, `icon`, `color`, `order`).
  - `settings.json`: Menyimpan preferensi tema (`dark`/`light`), URL background kustom, dan password admin (default: `admin`).
- **Autentikasi:** Token header sederhana (`ADMIN_TOKEN = "token-rahasia-localdash-123"`) untuk operasi tulis/hapus/pengaturan.

### Frontend
- **Arsitektur:** Vanilla Single Page Application (SPA) pada `public/index.html`.
- **Styling & UI:** Tailwind CSS (CDN), FontAwesome 6, Particles.js (latar partikel interaktif).
- **Interaktivitas:** SortableJS (Drag-and-drop kartu layanan saat mode admin aktif).
- **Fitur Khusus:**
  - Mode Gelap / Terang (Dark / Light Theme).
  - Quick View Modal (preview layanan via iframe / picture-in-picture).
  - Analog & Digital Live Clock.
  - Live Host System Monitor (CPU & RAM usage via endpoint `/api/sysinfo`).
  - PWA Ready (`manifest.json` & `sw.js`).

---

## 🔌 3. ENDPOINT API UTAMA (`server.js`)
1. **Autentikasi:**
   - `POST /api/login` : Validasi password admin.
   - `POST /api/change-password` : Mengubah password admin langsung dari UI.
2. **Settings & Wallpaper:**
   - `GET /api/settings` : Mengambil konfigurasi tema dan background.
   - `POST /api/settings` (Auth) : Menyimpan perubahan konfigurasi.
   - `POST /api/upload-bg` (Auth) : Upload berkas gambar latar belakang ke folder `public/uploads/`.
3. **Katalog Layanan (Links):**
   - `GET /api/links` : Mengambil daftar layanan terurut berdasarkan `order`.
   - `POST /api/links` (Auth) : Menambah layanan baru.
   - `PUT /api/links/:id` (Auth) : Mengubah data layanan.
   - `PUT /api/links/reorder` (Auth) : Menyimpan urutan baru hasil drag-and-drop.
   - `DELETE /api/links/:id` (Auth) : Menghapus layanan.
4. **Health Check & Latensi:**
   - `GET /api/status?url=...` : Cek ketersediaan layanan (*HTTP/HTTPS response code 200-499 dianggap online; socket TCP ping fallback*) dengan waktu latensi ms. Polling otomatis berkala di UI.
5. **System Monitor & Maintenance:**
   - `GET /api/sysinfo` : Pemantauan CPU, RAM, dan Uptime server host.
   - `GET /api/backup` (Auth) : Download backup `data.json` dan `settings.json` dalam satu file JSON.
   - `POST /api/restore` (Auth) : Restore data dan konfigurasi dari file backup.

---

## 📂 4. STRUKTUR DIREKTORI
```
C:\Users\iphoenkz\Music\LMS-6Katalog\
├── INGATAN.md                # Berkas Memori AI (Dokumen ini)
├── README.md                 # Panduan instalasi Proxmox LXC & update aplikasi
├── server.js                 # Express server & API endpoints
├── data.json                 # Database kartu layanan lokal
├── data.sample.json          # Contoh data awal layanan
├── settings.json             # Konfigurasi dashboard & password
├── settings.sample.json      # Contoh konfigurasi awal
├── docker-compose.yml        # Konfigurasi Docker jika dijalankan di container
├── package.json              # Dependensi npm (cors, express, multer)
└── public\
    ├── index.html            # Halaman utama katalog & dashboard
    ├── icon.svg              # Ikon aplikasi / PWA
    ├── manifest.json         # Manifest PWA
    ├── sw.js                 # Service Worker PWA
    └── uploads\              # Direktori upload wallpaper kustom
```

---

## 🚀 5. RIWAYAT PERUBAHAN & STATUS TERAKHIR
- **Status Repository:** Branch `main` up to date dengan remote.
- **Pembaruan Terkini:**
  - Penambahan real-time polling pada `fetchStatus` untuk pembaruan status online/offline otomatis tanpa reload.
  - Perbaikan layout tombol Quick View dan Admin agar tidak bertumpukan dengan teks status.
  - Fitur ganti password admin langsung dari UI.
  - Header responsif untuk layar kecil/ponsel agar tombol logout tetap mudah diakses.
  - Perbaikan deteksi health check HTTP dan skema warna status dot (kuning: checking, hijau: online, merah: offline).
  - Dokumentasi panduan update aman dengan `git pull` & PM2 di `README.md`.
  - **Kalkulasi CPU & RAM Real-time Presisi:** Mengganti rumus `loadavg` dengan pembacaan cgroup v1/v2 Proxmox LXC dan delta CPU tick OS, disertai indikator visual dinamis (sky/green, amber, red) serta polling 3 detik.
