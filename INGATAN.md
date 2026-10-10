# 🧠 INGATAN PROYEK LOCALDASH PRO (MEMORY PERSISTENCE)
> **Catatan:** Dokumen ini adalah memori inti AI assistant (Antigravity). Setiap kali sesi dimulai ulang atau login kembali, dokumen ini berfungsi sebagai sumber kebenaran (*source of truth*) seluruh riwayat konteks proyek, preferensi pengguna, arsitektur teknis, dan fitur sistem.

---

## 📌 1. PROFIL PENGGUNA & PREFERENSI SISTEM
- **Bahasa Komunikasi:** Bahasa Indonesia (ramah, jelas, teknis, dan *to the point*).
- **Domain Proyek:** **Khanza.NET LocalDash** (Katalog & Dashboard Layanan Server IT Lokal / Homelab untuk Proxmox LXC, TrueNAS, Raspberry Pi, dll).
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
  - **Menu Kategori Navigasi Elegan (Top Pill Tabs):** Implementasi menu tab/pills kategori di bagian atas dengan counter badge, pendeteksi ikon otomatis, filter presisi (hanya kategori yang dipilih yang tampil di halaman), status tab tersimpan di `localStorage`, tombol kembali "Semua Kategori", serta sinkronisasi pencarian kartu dan drag-and-drop.
  - **Pembaruan Branding & Footer Perusahaan:** Penyesuaian nama utama aplikasi menjadi **Khanza.NET LocalDash** serta penambahan badge resmi keanggotaan *"Khanza.NET LocalDash is a member of PT. Khanza Digital Nusantara"* di footer dengan desain elegan.
  - **Overhaul Visual Mode Siang (Vibrant & High-Contrast Light Mode):** Peningkatan kontras teks judul section (tidak lagi pucat/samar), kartu layanan dengan latar putih solid + soft shadow elegan, kotak URL berubah menjadi code-badge terang, tombol aksi header putih bersih, jam analog dan indikator performa bergaris tegas, serta overlay frosted-blur 93% agar wallpaper background tidak mengganggu keterbacaan.
  - **Live Service Status Badges (Total, Online, & Offline):** Penambahan widget ringkasan status layanan homelab real-time di atas menu navigasi kategori (`Total`, `Online` dengan pulsing green dot, `Offline` dengan red dot). Dilengkapi sinkronisasi status global instan tanpa flicker saat berpindah kategori serta pembaruan otomatis setiap 10 detik.
  - **Penerapan 7 Fitur Esensial Homelab & Server Dashboard:**
    1. **Tombol Refresh Manual:** Tombol "Cek Ulang" dengan ikon berputar (*spin animation*) untuk melakukan ping instan ke seluruh server tanpa menunggu interval otomatis.
    2. **Filter Klik Badge Status (Troubleshooting Mode):** Mengklik badge Online atau Offline langsung menyaring daftar layanan di layar (misal memfokuskan pengecekan hanya pada server yang sedang down), disertai banner filter dan tombol reset cepat.
    3. **Layanan Favorit (Starred / Pinned):** Kemampuan menyematkan layanan penting dengan tombol bintang ⭐ di setiap kartu, tab dedicated *"⭐ Favorit"* di bilah navigasi atas, serta penyimpanan preferensi di `localStorage` dan tersinkronisasi dengan opsi pin server.
    4. **Keterangan / Tag Node Chip:** Field opsional keterangan/node (contoh: `Port 8006 • Node 101` atau `Server Utama`) pada form tambah/edit link yang ditampilkan rapi sebagai chip badge berikon tag di kartu layanan.
    5. **Quick Copy IP / URL:** Tombol salin satu-klik pada kotak URL setiap kartu dengan animasi konfirmasi centang hijau dan toast feedback instan.
    6. **Peringatan Suara Server Down:** Fitur notifikasi audio menggunakan *Web Audio API* bawaan peramban (tanpa perlu aset audio luar) yang membunyikan nada peringatan saat server yang sebelumnya online terdeteksi offline. Dilengkapi sakelar pengaktifan di modal pengaturan.
    7. **Keyboard Shortcut Global & Toast System:** Shortcut keyboard instan (`/` untuk langsung fokus mencari layanan, `Escape` untuk menutup seluruh modal aktif atau keluar dari pencarian) serta sistem notifikasi toast (*toast container*) yang responsif dan elegan.
  - **Penerapan 5 Fitur Lanjutan Berkelas Profesional:**
    1. **Widget Monitoring Kapasitas Disk / Storage Host (`DISK`):** Pembacaan kapasitas penyimpanan host secara *native* (`fs.statfsSync`) yang terintegrasi pada widget sistem di samping CPU & RAM. Dilengkapi bilah warna dinamis (indigo, amber >75%, red >85%) dan tooltip detail kapasitas terpakai, total, dan sisa GB.
    2. **Riwayat Kestabilan Uptime (Mini Sparkline Bars):** Pelacakan 5 riwayat ping terakhir per layanan yang divisualisasikan dengan 5 balok kecil horizontal (hijau = online, merah = offline) serta persentase keandalan (*uptime percentage*) langsung pada kartu layanan.
    3. **Deteksi Sisa Hari Sertifikat SSL / HTTPS:** Server otomatis mengekstrak sertifikat TLS/SSL pada layanan HTTPS via `getPeerCertificate()`, menghitung sisa hari kedaluwarsa, dan menampilkan chip status sertifikat (hijau aman, atau kuning/oranye berkedip dengan peringatan jika tersisa < 14 hari).
    4. **Papan Catatan Jaringan & IP Subnet (*Network Scratchpad*):** Panel catatan cepat terdedikasi (`#notesModal` & endpoint `/api/network-notes`) untuk menyimpan informasi konfigurasi Gateway, DNS Server, VLAN ID, alokasi static IP, dan port tanpa perlu dokumen eksternal.
    5. **Ekspor Bookmark Browser Standar (*HTML Bookmark Export*):** Tombol ekspor satu-klik di modal pengaturan untuk mengunduh seluruh kategori dan tautan katalog ke format standar *Netscape Bookmark File* (`.html`) yang siap diimpor ke Google Chrome, Mozilla Firefox, Microsoft Edge, atau Safari.
  - **Peningkatan Kontras & Keterbacaan Mode Gelap (Dark Mode High-Contrast Enhancement):**
    - Meningkatkan kecerahan teks sekunder pudar (`text-slate-400` dinaikkan ke `#cbd5e1` / slate-300 dan `text-slate-300` dinaikkan ke `#f1f5f9` / slate-100).
    - Memperjelas teks pembuka / greeting (*"Selamat Pagi, Sugeng Rawuh!"*) menjadi `text-slate-200 font-medium`.
    - Merombak tampilan modal Catatan Jaringan & modal lainnya: teks deskripsi dikemas dalam *info-box* aksen biru langit (`bg-sky-500/10 border-sky-500/30 text-sky-200`), textarea dengan latar kontras tinggi `bg-black/60 border-slate-600`, dan teks placeholder yang tajam serta mudah dibaca.
    - Peningkatan ketajaman kartu layanan (*glass card*) di mode gelap dengan latar `rgba(17, 24, 39, 0.85)` dan border halus yang menyala saat di-hover.
