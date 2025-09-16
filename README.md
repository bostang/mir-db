# Proyek Manajemen Aset Digital

Proyek ini adalah sistem web komprehensif untuk mengelola aset digital utama perusahaan, yang mencakup data aplikasi, penanggung jawab (PIC), dan tautan terkait. Proyek ini terdiri dari dua komponen utama: **front-end** yang dibangun dengan **React** dan **back-end** yang dibangun dengan **Node.js** menggunakan framework **Express**.

## Fitur Utama

- **Manajemen Aplikasi**: Sistem CRUD (Create, Read, Update, Delete) lengkap untuk mengelola data aplikasi.
- **Manajemen PIC**: Kelola data individu atau tim yang bertanggung jawab atas setiap aset.
- **Manajemen Tautan**: Kelola tautan penting yang terkait dengan aplikasi, seperti dokumentasi, repositori, atau dasbor.
- **Arsitektur Modular**: Proyek terstruktur dengan jelas menjadi direktori `frontend` dan `backend` untuk memfasilitasi pengembangan dan pemeliharaan yang independen.

-----

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- **Node.js** (versi 14 atau lebih baru)
- **npm** atau **Yarn**

-----

## Struktur Proyek

```tree
/nama-proyek-anda
├─── /backend/
│    ├─── package.json
│    ├─── server.js
│    └─── ... (file backend lainnya)
├─── /frontend/
│    ├─── public/
│    ├─── src/
│    │    ├─── App.js
│    │    ├─── App.css
│    │    └─── index.js
│    ├─── package.json
│    └─── ... (file frontend lainnya)
├─── .gitignore
└─── README.md
```

-----

### Memulai Proyek

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan proyek Anda.

#### 1\. Memulai Back-end

Masuk ke direktori `backend`, instal dependensi, dan jalankan server.

```sh
cd backend
npm install
npm start
```

Server akan berjalan di `http://localhost:5000`. Pastikan database Anda telah dikonfigurasi dengan benar agar server dapat terhubung.

#### 2\. Memulai Front-end

Buka jendela terminal baru, masuk ke direktori `frontend`, instal dependensi, dan jalankan aplikasi React.

```sh
cd frontend
npm install
npm start
```

Aplikasi akan terbuka di `http://localhost:3000`. Aplikasi front-end akan secara otomatis terhubung ke back-end.

-----

### Penjelasan Teknis

- **Back-end**: Menggunakan **Express** untuk membuat API RESTful yang melayani data untuk aplikasi, PIC, dan tautan. Konfigurasi **CORS** telah ditambahkan untuk memastikan komunikasi yang lancar dengan front-end.
- **Front-end**: Dibangun dengan **React** dan diorganisir menjadi komponen-komponen yang terpisah untuk setiap fitur (aplikasi, PIC, tautan). Aplikasi ini mengambil data dari API, menampilkannya dalam tabel, dan menyediakan modal untuk operasi penambahan, pengeditan, dan penghapusan. Desain visualnya dibuat dengan **CSS kustom** untuk tampilan yang bersih dan modern.
