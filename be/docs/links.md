# 📑 API Documentation - Links Module

Dokumentasi rute untuk entitas **Links (Pranala)**. Modul ini melakukan *JOIN* dengan tabel `apps` untuk menyajikan informasi yang lebih lengkap.

**Base URL:** `http://localhost:5000/api/links`

---

## 1. Get All Links

Mengambil semua daftar pranala. Response mencakup `nama_aplikasi` dari tabel Apps.

* **Endpoint:** `/`
* **Method:** `GET`
* **Success Response:**
* **Code:** 200 OK
* **Content:** `Array of Objects`

```json
[
  {
    "application_id": "APP001",
    "nama_aplikasi": "E-Office",
    "docs_link": "https://wiki.company.com/e-office",
    "warroom_link": "https://teams.microsoft.com/l/...",
    "mini_warroom_link": "https://whatsapp.com/...",
    "notes": "PIC aktif di jam kerja"
  }
]

```

---

## 2. Download Links CSV

Mengunduh data seluruh pranala dalam format `.csv` dengan kolom yang sudah terformat untuk kebutuhan pelaporan.

* **Endpoint:** `/download/csv`
* **Method:** `GET`
* **Success Response:**
* **Code:** 200 OK
* **Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename=links.csv`

* **Error Response:**
* **Code:** 404 Not Found (Jika tidak ada data pranala)

---

## 3. Create New Link

Menghubungkan set tautan baru ke sebuah aplikasi.

* **Endpoint:** `/`
* **Method:** `POST`
* **Request Body:**

```json
{
  "application_id": "STRING (Required)",
  "docs_link": "URL STRING",
  "warroom_link": "URL STRING",
  "mini_warroom_link": "URL STRING",
  "notes": "TEXT"
}

```

* **Success Response:**
* **Code:** 201 Created
* **Content:** `"Pranala berhasil ditambahkan."`

* **Error Response:**
* **Code:** 400 Bad Request (Jika `application_id` tidak disertakan)

---

## 4. Update Link

Memperbarui tautan berdasarkan ID aplikasi.

* **Endpoint:** `/:id`
* **Method:** `PUT`
* **URL Params:** `id=[string]` (ID Aplikasi)
* **Request Body:**

```json
{
  "docs_link": "URL STRING",
  "warroom_link": "URL STRING",
  "mini_warroom_link": "URL STRING",
  "notes": "TEXT"
}

```

* **Success Response:**
* **Code:** 200 OK
* **Content:** `"Pranala berhasil diupdate."`

* **Error Response:**
* **Code:** 404 Not Found (Jika data tidak ditemukan)

---

## 5. Delete Link

Menghapus data pranala yang terasosiasi dengan ID aplikasi tertentu.

* **Endpoint:** `/:id`
* **Method:** `DELETE`
* **URL Params:** `id=[string]` (ID Aplikasi)
* **Success Response:**
* **Code:** 200 OK
* **Content:** `"Pranala berhasil dihapus."`
