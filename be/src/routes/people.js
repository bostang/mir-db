const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { convertToCsv } = require('../utils/csvHelper');

// 1. READ (GET semua PIC dengan Pagination & Search)
router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; 
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = `SELECT p.npp, p.nama, p.posisi, p.division, p.email, p.phone FROM people p`;
    const params = [];

    if (search) {
        // Menggunakan operator + untuk penggabungan string yang lebih aman di SQL Server
        query += ` WHERE p.nama LIKE '%' + ? + '%' OR p.npp LIKE '%' + ? + '%'`;
        params.push(search, search);
    }

    query += ` ORDER BY p.nama OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    db.query(query, params, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// 2. DOWNLOAD CSV
router.get('/download/csv', (req, res, next) => {
    const query = "SELECT * FROM people";
    db.query(query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return res.status(404).send('Tidak ada data PIC untuk diunduh.');
        }

        const csvData = convertToCsv(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=people.csv');
        res.status(200).send(csvData);
    });
});

// 3. BULK CHECK (POST untuk verifikasi email masal)
router.post('/bulk-check', (req, res, next) => {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.json([]);
    }

    const placeholders = emails.map(() => '?').join(',');
    const query = `
        SELECT npp, nama, division, email 
        FROM people 
        WHERE email IN (${placeholders})
    `;

    db.query(query, emails, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// 4. READ DETAIL (GET berdasarkan NPP)
router.get('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "SELECT npp, nama, posisi, division, email, phone FROM people WHERE npp = ?";
    
    db.query(query, [npp], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).send('PIC tidak ditemukan.');
        res.json(rows[0]);
    });
});

// 5. READ APPS BY NPP (Aplikasi yang dikelola oleh NPP tertentu)
router.get('/:npp/apps', (req, res, next) => {
    const npp = req.params.npp;
    const query = `
        SELECT a.*
        FROM apps a
        JOIN people_apps_map apm ON a.application_id = apm.application_id
        WHERE apm.npp = ?
    `;
    db.query(query, [npp], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// 6. CREATE (POST PIC baru)
router.post('/', (req, res, next) => {
    const { npp, nama, posisi, division, email, phone } = req.body;
    
    if (!npp || !nama) {
        return res.status(400).send('NPP dan nama harus diisi.');
    }

    const query = `
        INSERT INTO people (npp, nama, posisi, division, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [npp, nama, posisi, division, email, phone];

    db.query(query, params, (err, result) => {
        if (err) return next(err);
        res.status(201).send('PIC berhasil ditambahkan.');
    });
});

// 7. UPDATE (PUT berdasarkan NPP)
router.put('/:npp', (req, res, next) => {
    const nppParam = req.params.npp;
    const { nama, posisi, division, email, phone } = req.body;

    const query = `
        UPDATE people
        SET nama = ?, posisi = ?, division = ?, email = ?, phone = ?
        WHERE npp = ?
    `;
    const params = [nama, posisi, division, email, phone, nppParam];

    db.query(query, params, (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil diupdate.');
    });
});

// 8. DELETE (Hapus PIC berdasarkan NPP)
router.delete('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "DELETE FROM people WHERE npp = ?";
    db.query(query, [npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil dihapus.');
    });
});

module.exports = router;