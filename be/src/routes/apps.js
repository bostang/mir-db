const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Menggunakan modul database terpusat
const { convertToCsv } = require('../utils/csvHelper'); // Menggunakan helper CSV
const { success, error } = require('../utils/responseHandler');

// 1. READ (GET semua aplikasi)
router.get('/', (req, res, next) => {
    const query = "SELECT * FROM apps";
    db.query(query, (err, rows) => {
        if (err) return next(err);
        success(res, "Daftar aplikasi berhasil diambil", rows);
    });
});

// 2. DOWNLOAD CSV
router.get('/download/csv', (req, res, next) => {
    const query = "SELECT * FROM apps";
    db.query(query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return error(res, "Tidak ada data aplikasi untuk diunduh", 404);
            
        }

        const csvData = convertToCsv(rows);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=apps.csv');
        res.status(200).send(csvData);
    });
});

// 3. READ DETAIL (GET berdasarkan ID)
router.get('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "SELECT * FROM apps WHERE application_id = ?";
    db.query(query, [applicationId], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
            return error(res, "Aplikasi tidak ditemukan", 404);
        }
        success(res, "Detail aplikasi ditemukan", rows[0]);
    });
});

// 4. CREATE (POST aplikasi baru)
router.post('/', (req, res, next) => {
    const { application_id, nama_aplikasi, deskripsi_aplikasi, business_owner } = req.body;
    if (!application_id || !nama_aplikasi) {
        return error(res, "application_id dan nama_aplikasi harus diisi", 400);
    }
    const query = "INSERT INTO apps (application_id, nama_aplikasi, deskripsi_aplikasi, business_owner) VALUES (?, ?, ?, ?)";
    db.query(query, [application_id, nama_aplikasi, deskripsi_aplikasi, business_owner], (err, result) => {
        if (err) return next(err);
        success(res, "Aplikasi berhasil ditambahkan", null, 201);
    });
});

// 5. UPDATE (PUT aplikasi berdasarkan ID)
router.put('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { nama_aplikasi, deskripsi_aplikasi, business_owner } = req.body;
    const query = "UPDATE apps SET nama_aplikasi = ?, deskripsi_aplikasi = ?, business_owner = ? WHERE application_id = ?";
    db.query(query, [nama_aplikasi, deskripsi_aplikasi, business_owner, applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return error(res, "Aplikasi tidak ditemukan", 404);
        }
        success(res, "Aplikasi berhasil diupdate");
    });
});

// 6. DELETE (Hapus aplikasi berdasarkan ID)
router.delete('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "DELETE FROM apps WHERE application_id = ?";
    db.query(query, [applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return error(res, "Aplikasi tidak ditemukan", 404);
        }
        success(res, "Aplikasi berhasil dihapus");
    });
});

// 7. GET PEOPLE BY APP (Mendapatkan PIC untuk aplikasi tertentu)
router.get('/:id/people', (req, res, next) => {
    const applicationId = req.params.id;
    const query = `
        SELECT p.npp, p.nama, p.posisi, p.division, p.email, p.phone 
        FROM people p
        JOIN people_apps_map apm ON p.npp = apm.npp
        WHERE apm.application_id = ?
    `;
    db.query(query, [applicationId], (err, rows) => {
        if (err) return next(err);
        success(res, "Daftar PIC aplikasi berhasil diambil", rows);
    });
});

module.exports = router;