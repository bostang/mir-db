const express = require('express');
const sql = require('msnodesqlv8');
const cors = require('cors');

const app = express();
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

// Konfigurasi koneksi untuk Windows Authentication
const connectionString = "server=IFM-70556-293D;Database=mim_db;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server}";

app.use(cors());
app.use(express.json());

// Middleware penanganan kesalahan umum
app.use((err, req, res, next) => {
    console.error("Terjadi kesalahan:", err);
    res.status(500).send('Server Error');
});

// Endpoint dasar
app.get('/', (req, res) => {
    res.send('API berjalan dengan sukses!');
});

// Mengelompokkan rute untuk /api/links
const linksRouter = express.Router();

// READ (GET semua pranala)
linksRouter.get('/', (req, res, next) => {
    // Menggabungkan (JOIN) dengan tabel apps agar nama aplikasi bisa ditampilkan
    const query = `
        SELECT l.*, a.nama_aplikasi
        FROM links l
        JOIN apps a ON l.application_id = a.application_id
    `;
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// CREATE (POST pranala baru)
linksRouter.post('/', (req, res, next) => {
    const { application_id, docs_link, warroom_link, notes } = req.body;
    if (!application_id) {
        return res.status(400).send('application_id harus diisi.');
    }
    const query = `
        INSERT INTO links (application_id, docs_link, warroom_link, notes)
        VALUES (?, ?, ?, ?)
    `;
    const params = [application_id, docs_link, warroom_link, notes];
    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        res.status(201).send('Pranala berhasil ditambahkan.');
    });
});

// UPDATE (PUT pranala berdasarkan application_id)
linksRouter.put('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { docs_link, warroom_link, notes } = req.body;
    const query = `
        UPDATE links
        SET docs_link = ?, warroom_link = ?, notes = ?
        WHERE application_id = ?
    `;
    const params = [docs_link, warroom_link, notes, applicationId];
    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Pranala tidak ditemukan.');
        }
        res.send('Pranala berhasil diupdate.');
    });
});

// DELETE (DELETE pranala berdasarkan application_id)
linksRouter.delete('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "DELETE FROM links WHERE application_id = ?";
    sql.query(connectionString, query, [applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Pranala tidak ditemukan.');
        }
        res.send('Pranala berhasil dihapus.');
    });
});

// Mengelompokkan rute untuk /api/apps
const appsRouter = express.Router();
appsRouter.get('/', (req, res, next) => {
    sql.query(connectionString, "SELECT * FROM apps", (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

appsRouter.get('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "SELECT * FROM apps WHERE application_id = ?";
    sql.query(connectionString, query, [applicationId], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
            return res.status(404).send('Aplikasi tidak ditemukan.');
        }
        res.json(rows[0]);
    });
});

appsRouter.post('/', (req, res, next) => {
    const { application_id, nama_aplikasi, deskripsi_aplikasi, business_owner } = req.body;
    if (!application_id || !nama_aplikasi) {
        return res.status(400).send('application_id dan nama_aplikasi harus diisi.');
    }
    const query = "INSERT INTO apps (application_id, nama_aplikasi, deskripsi_aplikasi, business_owner) VALUES (?, ?, ?, ?)";
    sql.query(connectionString, query, [application_id, nama_aplikasi, deskripsi_aplikasi, business_owner], (err, result) => {
        if (err) return next(err);
        res.status(201).send('Aplikasi berhasil ditambahkan.');
    });
});

// endpoint PUT untuk mengupdate data aplikasi
appsRouter.put('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { nama_aplikasi, deskripsi_aplikasi, business_owner } = req.body;
    const query = "UPDATE apps SET nama_aplikasi = ?, deskripsi_aplikasi = ?, business_owner = ? WHERE application_id = ?";
    sql.query(connectionString, query, [nama_aplikasi, deskripsi_aplikasi, business_owner, applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Aplikasi tidak ditemukan.');
        }
        res.send('Aplikasi berhasil diupdate.');
    });
});

// Mengelompokkan rute untuk /api/people
const peopleRouter = express.Router();


// Endpoint untuk menambahkan PIC baru
// peopleRouter.post('/', (req, res, next) => {
//     const { npp, nama, posisi, division, email, phone } = req.body;
//     if (!npp || !nama) {
//         return res.status(400).send('NPP dan nama harus diisi.');
//     }
//     const query = `
//         INSERT INTO people (npp, nama, posisi, division, email, phone)
//         VALUES (?, ?, ?, ?, ?, ?)
//     `;
//     const params = [npp, nama, posisi, division, email, phone];
//     sql.query(connectionString, query, params, (err, result) => {
//         if (err) return next(err);
//         res.status(201).send('PIC berhasil ditambahkan.');
//     });
// });

// 2. CREATE (POST) - Sesuai Field Baru
peopleRouter.post('/', (req, res, next) => {
    const { npp, nama, posisi, division, email, phone } = req.body;
    
    if (!npp || !nama) {
        return res.status(400).send('NPP dan nama harus diisi.');
    }

    const query = `
        INSERT INTO people (npp, nama, posisi, division, email, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [npp, nama, posisi, division, email, phone];

    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        res.status(201).send('PIC berhasil ditambahkan.');
    });
});

// endpoint PUT untuk mengupdate data PIC
// peopleRouter.put('/:npp', (req, res, next) => {
//     const npp = req.params.npp;
//     const { nama, posisi, division, email, phone } = req.body;
//     const query = `
//         UPDATE people
//         SET nama = ?, posisi = ?, division = ?, email = ?, phone = ?
//         WHERE npp = ?
//     `;
//     const params = [npp, nama, posisi, division, email, phone];
//     sql.query(connectionString, query, params, (err, result) => {
//         if (err) return next(err);
//         if (result.rowsAffected === 0) {
//             return res.status(404).send('PIC tidak ditemukan.');
//         }
//         res.send('PIC berhasil diupdate.');
//     });
// });

// 3. UPDATE (PUT) - Sesuai Field Baru
peopleRouter.put('/:npp', (req, res, next) => {
    const nppParam = req.params.npp;
    const { nama, posisi, division, email, phone } = req.body;

    const query = `
        UPDATE people
        SET nama = ?, posisi = ?, division = ?, email = ?, phone = ?
        WHERE npp = ?
    `;
    // Urutan params harus sama dengan urutan '?' di query
    const params = [nama, posisi, division, email, phone, nppParam];

    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil diupdate.');
    });
});

// Endpoint untuk menghapus PIC
peopleRouter.delete('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "DELETE FROM people WHERE npp = ?";
    sql.query(connectionString, query, [npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil dihapus.');
    });
});

peopleRouter.post('/bulk-check', (req, res, next) => {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.json([]);
    }

    // Menyiapkan parameter tanda tanya (?) sebanyak jumlah email
    const placeholders = emails.map(() => '?').join(',');
    const query = `
        SELECT npp, nama, division, email 
        FROM people 
        WHERE email IN (${placeholders})
    `;

    sql.query(connectionString, query, emails, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

appsRouter.delete('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const query = "DELETE FROM apps WHERE application_id = ?";
    sql.query(connectionString, query, [applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Aplikasi tidak ditemukan.');
        }
        res.send('Aplikasi berhasil dihapus.');
    });
});

// Endpoint UNTUK MENDAPATKAN pic
appsRouter.get('/:id/people', (req, res, next) => {
    const applicationId = req.params.id;
    const query = `
        SELECT p.npp, p.nama, p.posisi, p.division, p.email, p.phone 
        FROM people p
        JOIN people_apps_map apm ON p.npp = apm.npp
        WHERE apm.application_id = ?
    `;
    sql.query(connectionString, query, [applicationId], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.use('/api/apps', appsRouter);

// Endpoint untuk mendapatkan semua PIC
// peopleRouter.get('/')
peopleRouter.get('/', (req, res, next) => {
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

    sql.query(connectionString, query, params, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});


// peopleRouter.get('/:npp', (req, res, next) => {
//     const npp = req.params.npp;
//     const query = "SELECT p.npp, p.nama, p.posisi, p.division, p.email, p.phone FROM people p WHERE p.npp = ?";
//     sql.query(connectionString, query, [npp], (err, rows) => {
//         if (err) return next(err);
//         if (rows.length === 0) {
//             return res.status(404).send('PIC tidak ditemukan.');
//         }
//         res.json(rows[0]);
//     });
// });

// 4. GET Detail berdasarkan NPP
peopleRouter.get('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "SELECT npp, nama, posisi, division, email, phone FROM people WHERE npp = ?";
    
    sql.query(connectionString, query, [npp], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).send('PIC tidak ditemukan.');
        res.json(rows[0]);
    });
});

peopleRouter.get('/:npp/apps', (req, res, next) => {
    const npp = req.params.npp;
    const query = `
        SELECT a.*
        FROM apps a
        JOIN people_apps_map apm ON a.application_id = apm.application_id
        WHERE apm.npp = ?
    `;
    sql.query(connectionString, query, [npp], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// Endpoint untuk mendapatkan semua relasi app-people
app.get('/api/app-people-map', (req, res, next) => {
    const query = `
        SELECT
            apm.application_id,
            a.nama_aplikasi,
            apm.npp,
            ISNULL(p.nama, 'Data Tidak Ada') AS nama_pic, -- Menggunakan ISNULL sebagai pengaman
            apm.note
        FROM people_apps_map apm
        LEFT JOIN apps a ON apm.application_id = a.application_id
        LEFT JOIN people p ON apm.npp = p.npp
    `;
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// Endpoint untuk menghapus relasi app-people
app.delete('/api/app-people-map', (req, res, next) => {
    const { application_id, npp } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "DELETE FROM people_apps_map WHERE application_id = ? AND npp = ?";
    sql.query(connectionString, query, [application_id, npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Relasi tidak ditemukan.');
        }
        res.send('Relasi berhasil dihapus.');
    });
});

// Endpoint untuk menambahkan relasi people ke aplikasi
app.post('/api/app-people-map', (req, res, next) => {
    const { application_id, npp, note } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "INSERT INTO people_apps_map (application_id, npp, note) VALUES (?, ?, ?)";
    sql.query(connectionString, query, [application_id, npp, note], (err, result) => {
        if (err) return next(err);
        res.status(201).send('Relasi berhasil ditambahkan.');
    });
});

// Endpoint untuk mengunduh data Aplikasi dalam format CSV
appsRouter.get('/download/csv', (req, res, next) => {
    const query = "SELECT * FROM apps";
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return res.status(404).send('Tidak ada data aplikasi untuk diunduh.');
        }

        // Fungsi untuk mengonversi array of objects menjadi string CSV
        const convertToCsv = (data) => {
            const header = Object.keys(data[0]).join(',') + '\n';
            const body = data.map(row => Object.values(row).map(value => {
                // Tangani nilai null dan karakter khusus
                if (value === null) return '';
                // Enclose string values in double quotes if they contain commas
                const stringValue = String(value);
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',')).join('\n');
            return header + body;
        };
        
        const csvData = convertToCsv(rows);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=apps.csv');
        res.status(200).send(csvData);
    });
});

// Endpoint untuk mengunduh data PIC dalam format CSV
peopleRouter.get('/download/csv', (req, res, next) => {
    const query = "SELECT * FROM people";
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return res.status(404).send('Tidak ada data PIC untuk diunduh.');
        }

        // Fungsi untuk mengonversi array of objects menjadi string CSV
        const convertToCsv = (data) => {
            const header = Object.keys(data[0]).join(',') + '\n';
            const body = data.map(row => Object.values(row).map(value => {
                // Tangani nilai null dan karakter khusus
                if (value === null) return '';
                // Enclose string values in double quotes if they contain commas
                const stringValue = String(value);
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',')).join('\n');
            return header + body;
        };
        
        const csvData = convertToCsv(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=people.csv');
        res.status(200).send(csvData);
    });
});

// Endpoint baru untuk mengunduh data relasi dalam format CSV
app.get('/api/app-people-map/download/csv', (req, res, next) => {
    const query = `
        SELECT
            apm.application_id,
            a.nama_aplikasi,
            apm.npp,
            p.nama AS nama_people,
            apm.note
        FROM people_apps_map apm
        JOIN apps a ON apm.application_id = a.application_id
        JOIN people p ON apm.npp = p.npp
    `;
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);

        if (rows.length === 0) {
            return res.status(404).send('Tidak ada data relasi untuk diunduh.');
        }

        // Fungsi untuk mengonversi array of objects menjadi string CSV
        const convertToCsv = (data) => {
            const header = Object.keys(data[0]).join(',') + '\n';
            const body = data.map(row => Object.values(row).map(value => {
                if (value === null) return '';
                const stringValue = String(value);
                return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
            }).join(',')).join('\n');
            return header + body;
        };

        const csvData = convertToCsv(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=app_people_relations.csv');
        res.status(200).send(csvData);
    });
});

// Tambahkan ini di bagian linksRouter (sebelum app.use('/api/links', linksRouter))
linksRouter.get('/download/csv', (req, res, next) => {
    const query = `
        SELECT l.application_id, a.nama_aplikasi, l.docs_link, l.warroom_link, l.notes
        FROM links l
        JOIN apps a ON l.application_id = a.application_id
    `;
    
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) return res.status(404).send('Tidak ada data pranala.');

        const convertToCsv = (data) => {
            const header = Object.keys(data[0]).join(',') + '\n';
            const body = data.map(row => Object.values(row).map(value => {
                if (value === null) return '';
                const stringValue = String(value);
                // Ganti tanda kutip dua menjadi ganda untuk format CSV yang benar
                return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
            }).join(',')).join('\n');
            return header + body;
        };

        const csvData = convertToCsv(rows);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=links.csv');
        res.status(200).send(csvData);
    });
});

app.use('/api/people', peopleRouter);
app.use('/api/links', linksRouter);

// Mulai server
app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di port ${HOST}:${PORT}`);
});