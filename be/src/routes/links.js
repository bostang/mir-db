const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { convertToCsv } = require('../utils/csvHelper');

// 1. READ (GET semua pranala dengan JOIN ke tabel apps)
router.get('/', (req, res, next) => {
    // Menggabungkan (JOIN) dengan tabel apps agar nama aplikasi bisa ditampilkan
    const query = `
        SELECT l.*, a.nama_aplikasi
        FROM links l
        JOIN apps a ON l.application_id = a.application_id
    `;
    db.query(query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// 2. DOWNLOAD CSV
router.get('/download/csv', (req, res, next) => {
    const query = `
        SELECT l.application_id, a.nama_aplikasi, l.docs_link, l.warroom_link, l.notes
        FROM links l
        JOIN apps a ON l.application_id = a.application_id
    `;
    
    db.query(query, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).send('Tidak ada data pranala.');

        const csvData = convertToCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=links.csv');
        res.status(200).send(csvData);
    });
});

// 3. CREATE (POST pranala baru)
router.post('/', (req, res, next) => {
    const { application_id, docs_link, warroom_link, notes } = req.body;
    if (!application_id) {
        return res.status(400).send('application_id harus diisi.');
    }
    const query = `
        INSERT INTO links (application_id, docs_link, warroom_link, notes)
        VALUES (?, ?, ?, ?)
    `;
    const params = [application_id, docs_link, warroom_link, notes];
    db.query(query, params, (err, result) => {
        if (err) return next(err);
        res.status(201).send('Pranala berhasil ditambahkan.');
    });
});

// 4. UPDATE (PUT berdasarkan application_id)
router.put('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { docs_link, warroom_link, notes } = req.body;
    const query = `
        UPDATE links
        SET docs_link = ?, warroom_link = ?, notes = ?
        WHERE application_id = ?
    `;
    const params = [docs_link, warroom_link, notes, applicationId];
    db.query(query, params, (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Pranala tidak ditemukan.');
        }
        res.send('Pranala berhasil diupdate.');
    });
});

// 5. DELETE (Hapus berdasarkan application_id)
router.delete('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "DELETE FROM links WHERE application_id = ?";
    db.query(query, [applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Pranala tidak ditemukan.');
        }
        res.send('Pranala berhasil dihapus.');
    });
});

module.exports = router;