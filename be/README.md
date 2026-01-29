# Back-end: API Manajemen Aset Digital

Back-end ini dibangun menggunakan **Node.js** dengan framework **Express** untuk menyediakan API RESTful yang melayani data untuk aplikasi front-end. API ini mengelola data untuk tiga entitas utama: **aplikasi**, **PIC** (Person in Charge), dan **links** (tautan terkait).

## Fitur Utama

- **API RESTful**: Menyediakan *endpoint* standar untuk operasi CRUD (Create, Read, Update, Delete) pada data aplikasi, PIC, dan tautan.
- **Middleware CORS**: Menggunakan paket `cors` untuk mengizinkan permintaan dari domain yang berbeda, memastikan koneksi yang lancar dengan front-end yang berjalan di server pengembangan.
- **Body Parser**: Menggunakan `express.json()` untuk mengurai *body* permintaan dalam format JSON.
- **Database Agnostic**: Kode dirancang agar mudah diadaptasi untuk berbagai sistem database seperti PostgreSQL, MySQL, atau MongoDB, meskipun contoh implementasinya akan menggunakan skema dasar untuk demonstrasi.

-----

## Dependensi

Pastikan dependensi berikut terinstal di direktori `backend` Anda:

- `express`: Framework web cepat dan minimalis untuk Node.js.
- `cors`: Middleware Node.js untuk menyediakan fungsionalitas CORS.
- (Opsional, tergantung implementasi) `axios`: Klien HTTP berbasis Promise untuk browser dan Node.js.

## Struktur Kode

```tree
/backend
├─── node_modules/
├─── package.json
├─── server.js atau index.js
└─── ...
```

- `server.js` (atau nama file utama lainnya) akan berisi logika utama server, definisi rute, dan konfigurasi middleware.

## Menjalankan Server

Untuk menjalankan server, navigasikan ke direktori `backend` dan jalankan perintah:

```sh
npm install
npm start
# atau: node server.js
```

Server akan aktif di `http://localhost:5000`.

-----

## Endpoint API

Berikut adalah deskripsi *endpoint* API utama. Semua *endpoint* menggunakan format JSON untuk komunikasi.

### Manajemen Aplikasi

| Metode | Endpoint                 | Deskripsi                          |
|:-------|:-------------------------|:-----------------------------------|
| `GET`  | `/api/apps`              | Mengambil semua data aplikasi.     |
| `POST` | `/api/apps`              | Menambah aplikasi baru.            |
| `PUT`  | `/api/apps/:id`          | Memperbarui data aplikasi.         |
| `DELETE`|`/api/apps/:id`           | Menghapus aplikasi.                |

### Manajemen PIC

| Metode | Endpoint                 | Deskripsi                          |
|:-------|:-------------------------|:-----------------------------------|
| `GET`  | `/api/people`              | Mengambil semua data PIC.          |
| `POST` | `/api/people`              | Menambah PIC baru.                 |
| `PUT`  | `/api/people/:id`          | Memperbarui data PIC.              |
| `DELETE`|`/api/people/:id`           | Menghapus PIC.                     |

### Manajemen Tautan

| Metode | Endpoint                 | Deskripsi                          |
|:-------|:-------------------------|:-----------------------------------|
| `GET`  | `/api/links`             | Mengambil semua data tautan.       |
| `POST` | `/api/links`             | Menambah tautan baru.              |
| `PUT`  | `/api/links/:id`         | Memperbarui data tautan.           |
| `DELETE`|`/api/links/:id`          | Menghapus tautan.                  |

-----

## Contoh Body Permintaan

- **POST /api/apps**:

    ```json
    {
      "application_id": "APL-001",
      "nama_aplikasi": "Sistem Inventaris",
      "deskripsi_aplikasi": "Aplikasi untuk melacak inventaris.",
      "business_owner": "John Doe"
    }
    ```

- **PUT /api/apps/:id**:

    ```json
    {
      "nama_aplikasi": "Sistem Inventaris (v2.0)",
      "business_owner": "Jane Smith"
    }
    ```
