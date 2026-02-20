# 📑 API Documentation - People Module

Dokumentasi rute untuk entitas **People (PIC)**. Modul ini menangani manajemen personil, pencarian massal, dan otomatisasi pembuatan NPP.

**Base URL:** `http://localhost:5000/api/people`

---

## 1. Get People (With Pagination & Search)

Mengambil daftar PIC dengan dukungan pencarian multi-kolom dan paginasi data.

* **Endpoint:** `/`
* **Method:** `GET`
* **Query Params:**
* `page`: Nomor halaman (Default: 1)
* `limit`: Jumlah data per halaman (Default: 100)
* `search`: Kata kunci untuk kolom nama, npp, email, divisi, atau posisi.

* **Success Response:** `Array of Objects`

```json
[
  {
    "npp": "X0154",
    "nama": "Andi Saputra",
    "posisi": "Developer",
    "division": "IT Digital",
    "email": "andi@company.com",
    "phone": "0812...",
    "company": "PT Maju Jaya"
  }
]

```

---

## 2. Bulk Update People

Memperbarui kolom tertentu untuk banyak PIC sekaligus berdasarkan daftar NPP.

* **Endpoint:** `/bulk-update`
* **Method:** `PUT`
* **Request Body:**

```json
{
  "npps": ["X0154", "X0155"],
  "fields": {
    "company": "New Company Name",
    "division": "New Division",
    "posisi": "New Position"
  }
}

```

* **Success Response:** `{ "message": "Update berhasil", "count": 2 }`

---

## 3. Bulk Delete People

Menghapus banyak data PIC sekaligus.

> **Note:** Akan gagal jika NPP masih terhubung sebagai Foreign Key di tabel relasi aplikasi.

* **Endpoint:** `/bulk-delete`
* **Method:** `DELETE`
* **Request Body:** `{ "npps": ["X0154", "X0155"] }`
* **Success Response:** `{ "message": "Hapus berhasil", "deleted_count": 2 }`

---

## 4. Bulk Insert (CSV Processor)

Menambahkan PIC baru secara masal. Sistem akan otomatis men-generate NPP baru dengan format `X0000` berdasarkan urutan terakhir di database.

* **Endpoint:** `/bulk-insert`
* **Method:** `POST`
* **Request Body:**

```json
{
  "people": [
    { "nama": "Budi", "email": "budi@mail.com", "division": "IT" },
    { "nama": "Siska", "email": "siska@mail.com", "division": "HR" }
  ]
}

```

* **Success Response:** `201 Created` dengan detail status per item (success/failed).

---

## 5. Bulk Check Email

Mengecek keberadaan email secara masal untuk validasi sebelum proses mapping.

* **Endpoint:** `/bulk-check`
* **Method:** `POST`
* **Request Body:** `{ "emails": ["andi@mail.com", "unknown@mail.com"] }`
* **Success Response:** Mengembalikan data PIC yang ditemukan untuk email-email tersebut.

---

## 6. Download People CSV

Ekspor seluruh data PIC ke format file `.csv`.

* **Endpoint:** `/download/csv`
* **Method:** `GET`
* **Success Response:** `File download (people.csv)`

---

## 7. Individual CRUD & Relations

Rute standar untuk manajemen satu data PIC dan melihat keterhubungan aplikasi.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/:npp` | Detail PIC berdasarkan NPP. |
| `GET` | `/:npp/apps` | Daftar aplikasi yang dikelola oleh PIC ini. |
| `POST` | `/` | Tambah PIC manual (Input NPP manual). |
| `PUT` | `/:npp` | Update data PIC individual. |
| `DELETE` | `/:npp` | Hapus satu data PIC. |

---

### Logic NPP Automation (Helper)

Sistem menggunakan helper internal `getNextNppNumber()` yang melakukan pencarian NPP tertinggi dengan format `X + Angka`. Jika database kosong, sistem akan memulai dari index **154** (sesuai spesifikasi sistem lama Anda).
