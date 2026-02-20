# API Endpoint Summary

## 1. Endpoint: People (PIC)

Manajemen data personil/PIC aplikasi.

| Method     | Endpoint        | Fungsi                            | Payload Utama (Body)           |
| ---------- | --------------- | --------------------------------- | ------------------------------ |
| **GET**    | `/`             | List PIC (Pagination & Search)    | -                              |
| **GET**    | `/:npp`         | Detail PIC berdasarkan NPP        | -                              |
| **GET**    | `/:npp/apps`    | Daftar aplikasi yang dikelola PIC | -                              |
| **POST**   | `/`             | Tambah PIC baru secara manual     | `{ npp, nama, email, ... }`    |
| **PUT**    | `/:npp`         | Update data PIC                   | `{ nama, posisi, phone, ... }` |
| **DELETE** | `/:npp`         | Hapus satu PIC                    | -                              |
| **POST**   | `/bulk-insert`  | Insert masal (via CSV/Import)     | `{ people: [...] }`            |
| **POST**   | `/bulk-check`   | Cek email yang sudah terdaftar    | `{ emails: [...] }`            |
| **PUT**    | `/bulk-update`  | Update masal field tertentu       | `{ npps: [], fields: {} }`     |
| **DELETE** | `/bulk-delete`  | Hapus banyak PIC sekaligus        | `{ npps: [] }`                 |
| **GET**    | `/download/csv` | Export seluruh data ke CSV        | -                              |

---

## 2. Endpoint: Relations (Mapping People-Apps)

Manajemen hubungan antara PIC dan aplikasi yang dikelola.

| Method     | Endpoint            | Fungsi                              | Payload Utama (Body)              |
| ---------- | ------------------- | ----------------------------------- | --------------------------------- |
| **GET**    | `/`                 | List semua relasi PIC-App           | -                                 |
| **POST**   | `/`                 | Tambah relasi satu-persatu          | `{ application_id, npp, layer }`  |
| **PUT**    | `/`                 | Update note/layer relasi tunggal    | `{ application_id, npp, layer }`  |
| **DELETE** | `/`                 | Hapus relasi spesifik               | `{ application_id, npp }`         |
| **POST**   | `/bulk-insert`      | Mapping masal PIC ke Apps           | `{ relations: [...] }`            |
| **PUT**    | `/bulk-update`      | Update masal note/layer             | `{ keys: [], fields: {} }`        |
| **DELETE** | `/bulk-delete`      | Hapus masal relasi terpilih         | `{ relations: [] }`               |
| **POST**   | `/instant-register` | Daftar user baru & mapping otomatis | `{ application_id, nama, email }` |
| **GET**    | `/download/csv`     | Export data mapping ke CSV          | -                                 |

---

Tentu, ini adalah rangkuman endpoint untuk **Apps** dan **Links**. Karena biasanya `Apps` adalah tabel induk (Master Data) dan `Links` adalah data pendukung (seperti URL Environment atau dokumentasi), berikut adalah strukturnya:

## 3. Endpoint: Apps (Master Data Aplikasi)

Pusat data seluruh aplikasi yang terdaftar di sistem.

| Method     | Endpoint        | Fungsi                                 | Payload Utama (Body)                |
| ---------- | --------------- | -------------------------------------- | ----------------------------------- |
| **GET**    | `/`             | List semua aplikasi (Search & Filter)  | -                                   |
| **GET**    | `/:id`          | Detail spesifik satu aplikasi          | -                                   |
| **GET**    | `/:id/pic`      | Daftar PIC yang mengelola aplikasi ini | -                                   |
| **POST**   | `/`             | Tambah aplikasi baru                   | `{ nama_aplikasi, deskripsi, ... }` |
| **PUT**    | `/:id`          | Update data aplikasi                   | `{ nama_aplikasi, status, ... }`    |
| **DELETE** | `/:id`          | Hapus aplikasi (dan relasi terkait)    | -                                   |
| **POST**   | `/bulk-insert`  | Import banyak aplikasi sekaligus       | `{ apps: [...] }`                   |
| **GET**    | `/download/csv` | Export master data aplikasi ke CSV     | -                                   |

---

## 4. Endpoint: Links (Environment & Resources)

Manajemen URL terkait aplikasi (misal: link Dev, Staging, Prod, atau Jira).

| Method     | Endpoint               | Fungsi                                   | Payload Utama (Body)             |
| ---------- | ---------------------- | ---------------------------------------- | -------------------------------- |
| **GET**    | `/`                    | List semua link yang tersedia            | -                                |
| **GET**    | `/app/:application_id` | Ambil semua link milik aplikasi tertentu | -                                |
| **POST**   | `/`                    | Tambah link baru untuk aplikasi          | `{ application_id, label, url }` |
| **PUT**    | `/:id`                 | Update URL atau Label link               | `{ label, url }`                 |
| **DELETE** | `/:id`                 | Hapus link tertentu                      | -                                |
