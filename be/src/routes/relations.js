const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { convertToCsv } = require('../utils/csvHelper');

// 1. READ (GET semua relasi app-people dengan detail lengkap)
router.get('/', (req, res, next) => {
    const query = `
        SELECT
            apm.application_id,
            a.nama_aplikasi,
            apm.npp,
            ISNULL(p.nama, 'Data Tidak Ada') AS nama_pic,
            p.posisi,
            p.division,
            apm.note,
            apm.layer
        FROM people_apps_map apm
        LEFT JOIN apps a ON apm.application_id = a.application_id
        LEFT JOIN people p ON apm.npp = p.npp
    `;
    db.query(query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// 2. DOWNLOAD CSV
router.get('/download/csv', (req, res, next) => {
    const query = `
        SELECT
            apm.application_id,
            a.nama_aplikasi,
            apm.npp,
            p.nama AS nama_people,
            apm.layer,
            apm.note
        FROM people_apps_map apm
        JOIN apps a ON apm.application_id = a.application_id
        JOIN people p ON apm.npp = p.npp
    `;
    db.query(query, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).send('Tidak ada data relasi.');

        const csvData = convertToCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=app_people_map.csv');
        res.status(200).send(csvData);
    });
});

// 3. CREATE (POST relasi baru)
router.post('/', (req, res, next) => {
    const { application_id, npp, note, layer } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "INSERT INTO people_apps_map (application_id, npp, note, layer) VALUES (?, ?, ?, ?)";
    db.query(query, [application_id, npp, note, layer], (err, result) => {
        if (err) return next(err);
        res.status(201).send('Relasi berhasil ditambahkan.');
    });
});

// 4. UPDATE (PUT relasi berdasarkan application_id DAN npp)
router.put('/', (req, res, next) => {
    const { application_id, npp, note, layer } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi untuk update.');
    }

    const query = `
        UPDATE people_apps_map 
        SET note = ?, layer = ? 
        WHERE application_id = ? AND npp = ?
    `;
    db.query(query, [note, layer, application_id, npp], (err, result) => {
        if (err) return next(err);
        res.send('Relasi berhasil diperbarui.');
    });
});

// 5. DELETE (Hapus relasi spesifik)
router.delete('/', (req, res, next) => {
    const { application_id, npp } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "DELETE FROM people_apps_map WHERE application_id = ? AND npp = ?";
    db.query(query, [application_id, npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Relasi tidak ditemukan.');
        }
        res.send('Relasi berhasil dihapus.');
    });
});

// 6. INSTANT REGISTER PIC (Handle New User + Mapping)
router.post('/instant-register', async (req, res, next) => {
    const { application_id, nama, email } = req.body;

    if (!application_id || !nama || !email) {
        return res.status(400).send('Data tidak lengkap.');
    }

    try {
        const checkUserQuery = "SELECT npp FROM people WHERE LOWER(email) = LOWER(?)";
        db.query(checkUserQuery, [email], (err, rows) => {
            if (err) return next(err);

            if (rows.length > 0) {
                insertRelation(rows[0].npp);
            } else {
                // PERBAIKAN: Gunakan UPPER agar x kecil dan X besar tidak berantakan
                // Dan pastikan hanya mengambil format X + Angka
                const lastNppQuery = `
                    SELECT TOP 1 npp 
                    FROM people 
                    WHERE npp LIKE 'X%' 
                    AND ISNUMERIC(SUBSTRING(npp, 2, LEN(npp))) = 1
                    ORDER BY CAST(SUBSTRING(npp, 2, LEN(npp)) AS INT) DESC
                `;

                db.query(lastNppQuery, (err, nppRows) => {
                    if (err) return next(err);

                    let nextNum = 154; // Fallback jika query tidak menemukan hasil valid
                    
                    if (nppRows.length > 0) {
                        // Mengambil angka saja dari string, misal 'X0153' -> 153
                        const lastNppString = nppRows[0].npp;
                        const match = lastNppString.match(/\d+/);
                        if (match) {
                            nextNum = parseInt(match[0], 10) + 1;
                        }
                    }

                    const newNpp = `X${String(nextNum).padStart(4, '0')}`;
                    console.log("NPP Baru yang dihasilkan:", newNpp);

                    const insertPeopleQuery = "INSERT INTO people (npp, nama, email, division) VALUES (?, ?, ?, ?)";
                    db.query(insertPeopleQuery, [newNpp, nama, email, 'EXTERNAL/UNKNOWN'], (err) => {
                        if (err) return next(err);
                        insertRelation(newNpp);
                    });
                });
            }
        });

        function insertRelation(npp) {
            const insertMapQuery = "INSERT INTO people_apps_map (application_id, npp, note) VALUES (?, ?, ?)";
            db.query(insertMapQuery, [application_id, npp, 'Added via Instant Validation'], (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY' || err.sqlState === '23000') {
                        return res.status(400).send('Sudah terdaftar sebagai PIC.');
                    }
                    return next(err);
                }
                res.status(201).json({ message: 'Berhasil didaftarkan!', npp: npp });
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;