# 📑 API Documentation - Relations Module

Dokumentasi rute untuk entitas **App-People Mapping**. Modul ini menggunakan kunci komposit (`application_id`, `npp`, dan `layer`).

**Base URL:** `http://localhost:5000/api/app-people-map`

---

## 1. Get All Relations

Mengambil daftar pemetaan PIC ke aplikasi dengan detail nama dari kedua tabel asal menggunakan `LEFT JOIN`.

* **Endpoint:** `/`
* **Method:** `GET`
* **Success Response:** `Array of Objects`

```json
[
  {
    "application_id": "APP001",
    "nama_aplikasi": "E-Office",
    "npp": "X0154",
    "nama_pic": "Andi Saputra",
    "posisi": "Developer",
    "division": "IT Digital",
    "layer": "L1",
    "note": "Primary Support"
  }
]

```

---

## 2. Bulk Insert Relations

Menambahkan banyak relasi sekaligus dengan validasi terhadap duplikasi dan daftar *layer* yang diizinkan.

* **Allowed Layers:** `L1, L2, L3, Business, Surroundings, Management, Principal, Others`
* **Endpoint:** `/bulk-insert`
* **Method:** `POST`
* **Request Body:**

```json
{
  "relations": [
    { "application_id": "A", "npp": "X", "layer": "L1", "note": "txt" }
  ]
}

```

* **Success Response:** Ringkasan jumlah sukses, *skipped* (jika sudah ada), dan *invalid*.

---

## 3. Bulk Update Relations

Memperbarui kolom `note` atau `layer` untuk banyak baris relasi sekaligus.

* **Endpoint:** `/bulk-update`
* **Method:** `PUT`
* **Request Body:**

```json
{
  "keys": [
    { "application_id": "A1", "npp": "X01", "layer": "L1" }
  ],
  "fields": { "newLayer": "L2", "note": "Updated info" }
}

```

---

## 4. Instant Register PIC

Fitur otomatisasi satu atap: Mengecek email, jika belum ada akan membuat user (PIC) baru dengan NPP otomatis, lalu langsung memetakannya ke aplikasi terkait.

* **Endpoint:** `/instant-register`
* **Method:** `POST`
* **Request Body:**

```json
{
  "application_id": "APP01",
  "nama": "User Baru",
  "email": "baru@mail.com"
}

```

* **Logic:**
  
1. Cek email di tabel `people`.
2. Jika tidak ada, panggil `getNextNppNumber()` dan `INSERT` ke `people`.
3. `INSERT` ke `people_apps_map`.

---

## 5. Standard CRUD

Manajemen relasi individual.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Tambah satu relasi baru. |
| `PUT` | `/` | Update note/layer relasi tunggal (perlu `application_id` & `npp`). |
| `DELETE` | `/` | Hapus relasi spesifik melalui request body. |
| `DELETE` | `/bulk-delete` | Hapus banyak relasi berdasarkan array of keys. |
| `GET` | `/download/csv` | Ekspor seluruh data mapping ke CSV. |
