# Portal Manajemen Aplikasi

Portal ini adalah aplikasi web yang dibangun untuk mengelola data aplikasi dan PIC (Person in Charge) terkait. Aplikasi ini terdiri dari backend (API) yang dibangun dengan Node.js dan frontend yang dibangun dengan React.

## Fitur Utama

* **Daftar Aplikasi:** Melihat, menambah, memperbarui, dan menghapus data aplikasi.
* **Pencarian Berdasarkan ID Aplikasi:** Menemukan semua PIC yang bertanggung jawab atas aplikasi tertentu.
* **Pencarian Berdasarkan NPP PIC:** Menemukan semua aplikasi yang dikelola oleh seorang PIC.

## Teknologi yang Digunakan

### Frontend

* **React:** Library JavaScript untuk membangun antarmuka pengguna.
* **Vite:** Tooling frontend untuk pengembangan yang cepat.
* **React-Router-Dom:** Untuk navigasi antar halaman.
* **React-Bootstrap:** Komponen UI yang dibuat dengan Bootstrap untuk tampilan yang rapi dan responsif.
* **Axios:** Klien HTTP untuk berinteraksi dengan API backend.

### Backend

* **Node.js:** Lingkungan runtime JavaScript.
* **Express.js:** Framework web untuk membangun API.
* **msnodesqlv8:** Driver Node.js untuk terhubung ke SQL Server.
* **CORS:** Middleware untuk mengizinkan permintaan lintas domain.

## Cara Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal.

### Persyaratan

* Node.js (versi 16 atau lebih baru)
* npm (atau yarn)
* Microsoft SQL Server dengan database `mir_db` dan tabel yang relevan (`apps`, `pics`, `app_pic_map`).

### 1\. Klon Repositori

```bash
git clone <URL_REPOSITORI_ANDA>
cd portal-aplikasi
```

### 2\. Konfigurasi Backend

Masuk ke folder `be` dan instal dependensi, lalu jalankan server:

```bash
cd be
npm install
node index.js
```

Pastikan Anda telah mengkonfigurasi `connectionString` di file `index.js` dengan benar agar terhubung ke database SQL Server Anda.

### 3\. Menjalankan Frontend

Buka terminal baru, masuk ke folder `fe`, instal dependensi, dan jalankan aplikasi React:

```bash
cd ../fe
npm install
npm run dev
```

Aplikasi frontend akan terbuka di browser Anda (biasanya di `http://localhost:5173`).

## Struktur Proyek

Berikut adalah gambaran singkat struktur folder proyek:

```tree
.
├── be/                 # Folder untuk backend Node.js
│   ├── index.js        # Server Express.js dan endpoint API
│   └── package.json    # Dependensi backend
├── fe/                 # Folder untuk frontend React
│   ├── src/
│   │   ├── components/ # Komponen UI yang dapat digunakan kembali
│   │   ├── pages/      # Halaman-halaman utama aplikasi
│   │   └── services/   # Klien API untuk berinteraksi dengan backend
│   └── package.json    # Dependensi frontend
└── README.md           # File dokumentasi ini
```
