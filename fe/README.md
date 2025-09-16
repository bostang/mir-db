# Frontend: Portal Manajemen Aplikasi

Proyek ini adalah bagian frontend dari Portal Manajemen Aplikasi, yang dibangun menggunakan React dengan Vite. Aplikasi ini bertugas untuk menampilkan data dari API backend dan menyediakan antarmuka interaktif bagi pengguna.

## Fitur

* Menampilkan daftar lengkap aplikasi.
* Menambah, memperbarui, dan menghapus data aplikasi.
* Melakukan pencarian PIC berdasarkan ID Aplikasi.
* Melakukan pencarian Aplikasi berdasarkan NPP PIC.
* Navigasi antar halaman yang mulus menggunakan React Router.
* Tampilan yang responsif dan rapi berkat React-Bootstrap.

-----

## Teknologi yang Digunakan

* **React:** Library utama untuk membangun antarmuka pengguna.
* **Vite:** Tooling frontend modern yang sangat cepat untuk pengembangan.
* **React Router DOM:** Untuk menangani routing dan navigasi di dalam aplikasi satu halaman (SPA).
* **React-Bootstrap:** Menggunakan komponen-komponen React yang sudah di-styling dengan Bootstrap, memudahkan pengembangan UI yang konsisten.
* **Axios:** Klien HTTP berbasis Promise untuk membuat permintaan ke API backend.

-----

## Memulai Proyek

Ikuti langkah-langkah berikut untuk menjalankan frontend secara lokal di mesin Anda.

### Prasyarat

* Pastikan Anda sudah memiliki **Node.js** dan **npm** yang terinstal di sistem Anda.
* Pastikan **server backend** sudah berjalan.

### Langkah-langkah

1. Buka terminal dan navigasi ke direktori proyek frontend:

    ```bash
    cd fe
    ```

2. Instal semua dependensi yang dibutuhkan:

    ```bash
    npm install
    ```

3. Jalankan aplikasi dalam mode pengembangan. Ini akan memulai server pengembangan dan membuka aplikasi di browser Anda:

    ```bash
    npm run dev
    ```

Aplikasi akan secara otomatis terbuka di `http://localhost:5173`. Perubahan apa pun yang Anda lakukan pada kode akan secara instan tercermin di browser berkat **Hot Module Replacement (HMR)** bawaan Vite.

-----

## Struktur Folder

```tree
fe/
├── public/                 # File statis (favicon, logo, dll.)
├── src/
│   ├── assets/             # Gambar, ikon, atau aset lainnya
│   ├── components/         # Komponen UI yang dapat digunakan kembali
│   │   ├── Navbar.jsx
│   │   ├── AppSearch.jsx
│   │   └── PicSearch.jsx
│   ├── pages/              # Komponen untuk setiap halaman
│   │   ├── AppsPage.jsx
│   │   └── LandingPage.jsx
│   ├── services/           # Logika interaksi dengan API backend
│   │   └── api.js
│   ├── App.jsx             # Komponen utama yang berisi routing
│   ├── main.jsx            # Titik masuk aplikasi
│   └── index.css           # Styling global Bootstrap
└── package.json            # Daftar dependensi dan script
```
