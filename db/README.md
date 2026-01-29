# 📘 Dokumentasi SQL Dasar untuk Database Aplikasi dan PIC

## Skema Database

![db-schema](./img/db_schema.png)

## Langkah buat database

Pastikan bahwa sudah membuat database `mim_db` di SQL Server.

Jalankan secara berurutan:

1. `create_tables.sql`
2. `insert_apps.sql`
3. `insert_people.sql`
4. `insert_people_apps_maps.sql`

## 🗃️ Struktur Tabel

- **`apps`**: Menyimpan informasi aplikasi.
- **`people`**: Menyimpan informasi PIC (Person In Charge).
- **`links`**: Menyimpan pranala terkait aplikasi.
- **`people_apps_map`**: Tabel penghubung antara aplikasi dan PIC (many-to-many).

---

## 🔍 Kueri Dasar

### 1. Menampilkan Semua Aplikasi

```sql
SELECT * FROM [dbo].[apps];
```

### 2. Menampilkan Semua PIC

```sql
SELECT * FROM [dbo].[people];
```

### 3. Menampilkan Semua Relasi Aplikasi dan PIC

```sql
SELECT * FROM [dbo].[people_apps_map];
```

---

## 🔎 Kueri Pencarian

### 4. Cari Aplikasi Berdasarkan Nama (case-insensitive)

```sql
SELECT [application_id], [nama_aplikasi]
FROM [dbo].[apps]
WHERE LOWER([nama_aplikasi]) LIKE '%cxo%';
```

### 5. Cari Aplikasi Berdasarkan Kata Kunci di Deskripsi

```sql
SELECT [application_id], [nama_aplikasi], [deskripsi_aplikasi]
FROM [dbo].[apps]
WHERE [deskripsi_aplikasi] LIKE '%Special%';
```

---

## 🔐 Kode Khusus Aplikasi

Gunakan `LIKE` untuk mencari aplikasi berdasarkan kategori khusus:

```sql
-- Contoh: Cari aplikasi yang berkaitan dengan LDAP
SELECT [application_id], [nama_aplikasi]
FROM [dbo].[apps]
WHERE [application_id] LIKE 'LDAP%';
```

Daftar kode khusus:

- `SECURITY__` : Security (PAM)
- `L1________` : L1
- `APP_______` : Aplikasi tanpa ID konsisten
- `LDAP______` : LDAP
- `NETWORK___` : Network
- `DATABASE__` : Database
- `SERVER____` : Server
- `SORX______` : SORX
- `ERM_______` : ERM
- `SSO_______` : SSO
- `KCLN______` : KCLN
- `EKSTERNAL_` : Eksternal
- `BISNIS____` : User Bisnis

---

## 🔗 Kueri Gabungan

### 6. Menampilkan Semua PIC untuk Aplikasi Tertentu

```sql
SELECT p.*
FROM [dbo].[people] p
JOIN [dbo].[people_apps_map] apm ON p.npp = apm.npp
WHERE apm.application_id = 'AMOLOM0001';
```

### 7. Menampilkan Semua Aplikasi yang Dimiliki oleh PIC Tertentu

```sql
SELECT a.*
FROM [dbo].[apps] a
JOIN [dbo].[people_apps_map] apm ON a.application_id = apm.application_id
WHERE apm.npp = '123456';
```

---

## 📎 Kueri Pranala

### 8. Menampilkan Pranala Aplikasi

```sql
SELECT a.application_id, a.nama_aplikasi, l.aod_doc_link, l.warroom_link
FROM [dbo].[apps] a
JOIN [dbo].[links] l ON a.application_id = l.application_id;
```
