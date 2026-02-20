const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { convertToCsv } = require('../utils/csvHelper');
const { allowedLayers } = require('../utils/constants');
const { success, error } = require('../utils/responseHandler');

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
        success(res, "Daftar relasi berhasil diambil", rows);
    });
});

// 7. BULK INSERT RELATIONS
router.post('/bulk-insert', async (req, res, next) => {
    const { relations } = req.body;

    if (!relations || !Array.isArray(relations)) {
        return error(res, 'Data tidak valid.', 400);
    }

    const results = {
        success: 0,
        skipped: 0,
        invalid: 0,
        details: []
    };

    const promises = relations.map(rel => {
        return new Promise((resolve) => {
            // 1. Validasi Opsi Layer
            if (!allowedLayers.includes(rel.layer)) {
                results.invalid++;
                results.details.push({ npp: rel.npp, appId: rel.application_id, status: 'Invalid Layer', layer: rel.layer });
                return resolve();
            }

            // 2. Cek apakah relasi (App + NPP + Layer) sudah ada
            const checkQuery = `SELECT 1 FROM people_apps_map WHERE application_id = ? AND npp = ? AND layer = ?`;
            
            db.query(checkQuery, [rel.application_id, rel.npp, rel.layer], (err, rows) => {
                if (err) {
                    results.invalid++;
                    resolve();
                } else if (rows.length > 0) {
                    // Jika sudah ada, kita skip (mencegah overwrite/duplicate error)
                    results.skipped++;
                    results.details.push({ npp: rel.npp, appId: rel.application_id, status: 'Already Exists' });
                    resolve();
                } else {
                    // 3. Insert jika belum ada
                    const insertQuery = `INSERT INTO people_apps_map (application_id, npp, layer, note) VALUES (?, ?, ?, ?)`;
                    db.query(insertQuery, [rel.application_id, rel.npp, rel.layer, rel.note], (err) => {
                        if (err) {
                            results.invalid++;
                        } else {
                            results.success++;
                        }
                        resolve();
                    });
                }
            });
        });
    });

    await Promise.all(promises);
    success(res, 'Proses bulk insert selesai', results);
});

// 8. BULK DELETE RELATIONS
router.delete('/bulk-delete', (req, res, next) => {
    const { relations } = req.body; // Array of {application_id, npp, layer}

    if (!relations || !Array.isArray(relations) || relations.length === 0) {
        return error(res, 'Data tidak valid.', 400);
    }

    // Karena PK nya komposit, kita hapus satu per satu dalam loop
    const promises = relations.map(rel => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM people_apps_map WHERE application_id = ? AND npp = ? AND layer = ?";
            db.query(query, [rel.application_id, rel.npp, rel.layer], (err) => {
                if (err) resolve({ status: 'failed', error: err.message });
                else resolve({ status: 'success' });
            });
        });
    });

    Promise.all(promises).then(() => {
        success(res, 'Berhasil menghapus relasi terpilih.');
    }).catch(next);
});

// 9. BULK UPDATE RELATIONS (Note & Layer)
router.put('/bulk-update', async (req, res, next) => {
    const { keys, fields } = req.body; 
    
    // Log ini HARUSNYA muncul sekarang jika request sampai
    // console.log("=== API BULK UPDATE DIPANGGIL ===");
    // console.log("Payload:", JSON.stringify(req.body, null, 2));

    if (!keys || !Array.isArray(keys) || keys.length === 0 || !fields) {
        return error(res, 'Data tidak lengkap.', 400);
    }

    const promises = keys.map(key => {
        return new Promise((resolve) => {
            let query = "";
            let params = [];
            
            // Penanganan khusus jika layer lama adalah null
            const layerCondition = (key.layer === null || key.layer === 'null') 
                ? "layer IS NULL" 
                : "layer = ?";

            if (fields.newLayer && allowedLayers.includes(fields.newLayer)) {
                query = `
                    UPDATE people_apps_map 
                    SET layer = ?, note = COALESCE(?, note)
                    WHERE application_id = ? AND npp = ? AND ${layerCondition}
                `;
                params = [fields.newLayer, fields.note, key.application_id, key.npp];
                if (layerCondition !== "layer IS NULL") params.push(key.layer);
                
            } else if (fields.note) {
                query = `
                    UPDATE people_apps_map 
                    SET note = ?
                    WHERE application_id = ? AND npp = ? AND ${layerCondition}
                `;
                params = [fields.note, key.application_id, key.npp];
                if (layerCondition !== "layer IS NULL") params.push(key.layer);
            } else {
                return resolve({ status: 'skipped', npp: key.npp });
            }

            db.query(query, params, (err, result) => {
                if (err) {
                    resolve({ status: 'error', npp: key.npp, error: err.message });
                } else if (result.affectedRows === 0) {
                    resolve({ status: 'not_found', npp: key.npp });
                } else {
                    resolve({ status: 'success', npp: key.npp });
                }
            });
        });
    });

    try {
        const results = await Promise.all(promises);
        success(res, 'Proses update selesai', results);
    } catch (error) {
        next(error);
    }
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
        if (rows.length === 0) return error(res, 'Tidak ada data relasi.', 404);

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
        return error(res, 'App ID dan NPP harus diisi.', 400);
    }

    const query = "INSERT INTO people_apps_map (application_id, npp, note, layer) VALUES (?, ?, ?, ?)";
    db.query(query, [application_id, npp, note, layer], (err, result) => {
        if (err) return next(err);
        success(res, 'Relasi berhasil ditambahkan.', null, 201);
    });
});

// 4. UPDATE (PUT relasi berdasarkan application_id DAN npp)
router.put('/', (req, res, next) => {
    const { application_id, npp, note, layer } = req.body;
    if (!application_id || !npp) {
        return error(res, 'App ID dan NPP harus diisi untuk update.', 400);
    }

    const query = `
        UPDATE people_apps_map 
        SET note = ?, layer = ? 
        WHERE application_id = ? AND npp = ?
    `;
    db.query(query, [note, layer, application_id, npp], (err, result) => {
        if (err) return next(err);
        success(res, 'Relasi berhasil diperbarui.');
    });
});

// 5. DELETE (Hapus relasi spesifik)
router.delete('/', (req, res, next) => {
    const { application_id, npp } = req.body;
    if (!application_id || !npp) {
        return error(res, 'App ID dan NPP harus diisi.', 400);
    }

    const query = "DELETE FROM people_apps_map WHERE application_id = ? AND npp = ?";
    db.query(query, [application_id, npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return error(res, 'Relasi tidak ditemukan.', 404);
        }
        success(res, 'Relasi berhasil dihapus.');
    });
});

// 6. INSTANT REGISTER PIC (Handle New User + Mapping)
router.post('/instant-register', async (req, res, next) => {
    const { application_id, nama, email } = req.body;

    if (!application_id || !nama || !email) {
        return error(res, 'Data tidak lengkap.', 400);
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
                    // console.log("NPP Baru yang dihasilkan:", newNpp);

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
                        return error(res, 'Sudah terdaftar sebagai PIC.', 400);
                    }
                    return next(err);
                }
                success(res, 'Berhasil didaftarkan!', { npp: npp }, 201);
            });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;