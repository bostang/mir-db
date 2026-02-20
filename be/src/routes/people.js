const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { convertToCsv } = require('../utils/csvHelper');
const { getNextNppNumber} = require('../utils/nppHelper');
const { success, error } = require('../utils/responseHandler');

// 1. READ (GET semua PIC dengan Pagination & Search)

router.get('/', (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; 
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = `SELECT npp, nama, posisi, division, email, phone, company FROM people`;
    const params = [];

    if (search) {
        const pattern = `%${search}%`;
        // Menambahkan filter ke kolom division, email, dan posisi
        query += ` WHERE nama LIKE ? 
                   OR npp LIKE ? 
                   OR email LIKE ? 
                   OR division LIKE ? 
                   OR posisi LIKE ?`;
        params.push(pattern, pattern, pattern, pattern, pattern);
    }

    query += ` ORDER BY npp DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    db.query(query, params, (err, rows) => {
        if (err) return next(err);
        success(res, "Daftar PIC berhasil diambil", rows);
    });
});

// 1. ENDPOINT BULK UPDATE (Pastikan tetap di atas router.get('/:npp'))

router.put('/bulk-update', async (req, res, next) => {
    const { npps, fields } = req.body;

    if (!npps || !Array.isArray(npps) || npps.length === 0 || !fields) {
        return error(res, 'Data tidak lengkap.', 400);
    }

    const filteredFields = {};
    ['company', 'division', 'posisi'].forEach(key => {
        if (fields[key]) filteredFields[key] = fields[key];
    });

    if (Object.keys(filteredFields).length === 0) {
        return error(res, 'Tidak ada kolom valid.', 400);
    }

    const setClauses = Object.keys(filteredFields).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(filteredFields);
    
    // PERBAIKAN: Buat jumlah placeholder sesuai jumlah NPP
    const placeholders = npps.map(() => '?').join(',');

    // Query SQL final
    const query = `UPDATE people SET ${setClauses} WHERE npp IN (${placeholders})`;
    
    // Gabungkan parameter: nilai kolom dulu, baru daftar NPP
    const finalParams = [...updateValues, ...npps];

    db.query(query, finalParams, (err, result) => {
        if (err) return next(err); // Biarkan global error handler yang urus
        success(res, `${npps.length} PIC berhasil diperbarui`, { updated_count: npps.length });
    });
});

// ENDPOINT BULK DELETE
router.delete('/bulk-delete', (req, res, next) => {
    const { npps } = req.body;

    if (!npps || !Array.isArray(npps) || npps.length === 0) {
        return error(res, 'Daftar NPP tidak valid.', 400);
    }

    // Buat placeholder (?,?,?) sesuai jumlah NPP
    const placeholders = npps.map(() => '?').join(',');
    const query = `DELETE FROM people WHERE npp IN (${placeholders})`;

    db.query(query, npps, (err, result) => {
        if (err) return next(err); // Biarkan global handler yang urus error 500
        const deletedCount = result.rowsAffected || result.affectedRows || npps.length;
        success(res, "Hapus masal berhasil", { deleted_count: deletedCount });
        
    });
});

// 2. ENDPOINT BULK INSERT PEOPLE (DARI CSV)
router.post('/bulk-insert', async (req, res, next) => {
    const { people } = req.body; // Array of {nama, email, division}

    if (!people || !Array.isArray(people)) {
        return error(res, 'Data people (array) diperlukan.', 400);
    }

    try {
        let currentNextNum = await getNextNppNumber();
        const results = [];
        
        // Kita gunakan loop untuk memastikan setiap orang dapat NPP unik
        // Note: Untuk performa ribuan data, gunakan bulk insert SQL, 
        // tapi untuk ratusan data, alur ini lebih aman bagi logic NPP custom Anda.
        for (const person of people) {
            const newNpp = `X${String(currentNextNum).padStart(4, '0')}`;
            
            // Cek apakah email sudah ada (opsional tapi disarankan)
            // Di sini kita langsung insert, jika email PK/Unique maka akan error di catch
            const insertQuery = `
                INSERT INTO people (npp, nama, email, division, company) 
                VALUES (?, ?, ?, ?, ?)
            `;
            
            await new Promise((resolve, reject) => {
                db.query(insertQuery, [
                    newNpp, 
                    person.nama, 
                    person.email, 
                    person.division || 'EXTERNAL/UNKNOWN', 
                    person.company || null
                ], (err) => {
                    if (err) {
                        // Jika email duplikat, kita lewati atau catat errornya
                        console.error(`Gagal insert ${person.email}:`, err.message);
                        results.push({ email: person.email, status: 'failed', reason: err.message });
                        resolve();
                    } else {
                        results.push({ email: person.email, npp: newNpp, status: 'success' });
                        currentNextNum++; // Naikkan angka untuk urutan berikutnya
                        resolve();
                    }
                });
            });
        }

        success(res, "Proses bulk insert selesai", results, 201);

    } catch (error) {
        next(error);
    }
});

// 3. BULK CHECK (POST untuk verifikasi email masal)
router.post('/bulk-check', (req, res, next) => {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return success(res, "Tidak ada email untuk dicek", []);
    }

    const placeholders = emails.map(() => '?').join(',');
    const query = `
        SELECT npp, nama, division, email 
        FROM people 
        WHERE email IN (${placeholders})
    `;

    db.query(query, emails, (err, rows) => {
        if (err) return next(err);
        success(res, "Verifikasi email selesai", rows);
    });
});

// 2. DOWNLOAD CSV
router.get('/download/csv', (req, res, next) => {
    const query = "SELECT * FROM people";
    db.query(query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return error(res, 'Tidak ada data PIC untuk diunduh.', 404);
        }

        const csvData = convertToCsv(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=people.csv');
        res.status(200).send(csvData);
    });
});



// 4. READ DETAIL (GET berdasarkan NPP)
router.get('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "SELECT npp, nama, posisi, division, email, phone FROM people WHERE npp = ?";
    
    db.query(query, [npp], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return error(res, 'PIC tidak ditemukan.', 404);
        success(res, "Detail PIC ditemukan", rows[0]);
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
        success(res, `Daftar aplikasi untuk NPP ${npp} berhasil diambil`, rows);
    });
});

// 6. CREATE (POST PIC baru)
router.post('/', (req, res, next) => {
    const { npp, nama, posisi, division, email, phone } = req.body;
    
    if (!npp || !nama) {
        return error(res, "NPP dan nama harus diisi", 400);
    }

    const query = `
        INSERT INTO people (npp, nama, posisi, division, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [npp, nama, posisi, division, email, phone];

    db.query(query, params, (err, result) => {
        if (err) return next(err);
        success(res, "PIC berhasil ditambahkan", null, 201);
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
            return error(res, "PIC tidak ditemukan", 404);
        }
        success(res, "PIC berhasil diupdate");
    });
});

// 8. DELETE (Hapus PIC berdasarkan NPP)
router.delete('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "DELETE FROM people WHERE npp = ?";
    db.query(query, [npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return error(res, "PIC tidak ditemukan", 404);
        }
        success(res, "PIC berhasil dihapus");
    });
});

module.exports = router;