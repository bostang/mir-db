# 📑 API Documentation - App Module

Dokumentasi rute untuk entitas **Applications (Apps)**.

**Base URL:** `http://localhost:5000/api/apps`

---

## 1. Get All Applications

Mengambil semua daftar aplikasi yang terdaftar di database.

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
    "deskripsi_aplikasi": "Sistem administrasi persuratan",
    "business_owner": "Divisi Sekretariat"
  }
]

```

---

## 2. Download Apps CSV

Mengunduh seluruh data aplikasi dalam format file `.csv`.

* **Endpoint:** `/download/csv`
* **Method:** `GET`
* **Success Response:**
* **Code:** 200 OK
* **Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename=apps.csv`

* **Error Response:**
* **Code:** 404 Not Found (Jika tidak ada data di database)

---

## 3. Get Application Detail

Mengambil informasi detail satu aplikasi berdasarkan ID-nya.

* **Endpoint:** `/:id`
* **Method:** `GET`
* **URL Params:** `id=[string/integer]`
* **Success Response:**
* **Code:** 200 OK
* **Content:** `Object`

* **Error Response:**
* **Code:** 404 Not Found (Jika ID tidak ditemukan)

---

## 4. Create New Application

Menambahkan data aplikasi baru ke sistem.

* **Endpoint:** `/`
* **Method:** `POST`
* **Request Body:**

```json
{
  "application_id": "STRING (Required)",
  "nama_aplikasi": "STRING (Required)",
  "deskripsi_aplikasi": "TEXT",
  "business_owner": "STRING"
}

```

* **Success Response:**
* **Code:** 201 Created
* **Content:** `"Aplikasi berhasil ditambahkan."`

* **Error Response:**
* **Code:** 400 Bad Request (Jika field wajib kosong)

---

## 5. Update Application

Memperbarui informasi aplikasi yang sudah ada.

* **Endpoint:** `/:id`
* **Method:** `PUT`
* **URL Params:** `id=[string]`
* **Request Body:**

```json
{
  "nama_aplikasi": "STRING",
  "deskripsi_aplikasi": "TEXT",
  "business_owner": "STRING"
}

```

* **Success Response:**
* **Code:** 200 OK
* **Content:** `"Aplikasi berhasil diupdate."`

---

## 6. Delete Application

Menghapus data aplikasi dari sistem.

* **Endpoint:** `/:id`
* **Method:** `DELETE`
* **URL Params:** `id=[string]`
* **Success Response:**
* **Code:** 200 OK
* **Content:** `"Aplikasi berhasil dihapus."`

---

## 7. Get People by App ID

Mendapatkan daftar personil (PIC) yang terhubung dengan aplikasi tertentu melalui tabel relasi.

* **Endpoint:** `/:id/people`
* **Method:** `GET`
* **URL Params:** `id=[string]`
* **Success Response:**
* **Code:** 200 OK
* **Content:** `Array of Objects (People Data)`

```json
[
  {
    "npp": "X0154",
    "nama": "Andi Saputra",
    "posisi": "Developer",
    "division": "IT Digital",
    "email": "andi@company.com",
    "phone": "0812345678"
  }
]

```
