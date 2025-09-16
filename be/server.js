const express = require('express');
const sql = require('msnodesqlv8');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi koneksi untuk Windows Authentication
const connectionString = "server=IFM-70556-293D;Database=mir_db;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server}";

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
    const { application_id, nama_aplikasi, deskripsi_singkat, business_owner } = req.body;
    if (!application_id || !nama_aplikasi) {
        return res.status(400).send('application_id dan nama_aplikasi harus diisi.');
    }
    const query = "INSERT INTO apps (application_id, nama_aplikasi, deskripsi_singkat, business_owner) VALUES (?, ?, ?, ?)";
    sql.query(connectionString, query, [application_id, nama_aplikasi, deskripsi_singkat, business_owner], (err, result) => {
        if (err) return next(err);
        res.status(201).send('Aplikasi berhasil ditambahkan.');
    });
});

// endpoint PUT untuk mengupdate data aplikasi
appsRouter.put('/:id', (req, res, next) => {
    const applicationId = req.params.id;
    const { nama_aplikasi, deskripsi_singkat, business_owner } = req.body;
    const query = "UPDATE apps SET nama_aplikasi = ?, deskripsi_singkat = ?, business_owner = ? WHERE application_id = ?";
    sql.query(connectionString, query, [nama_aplikasi, deskripsi_singkat, business_owner, applicationId], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Aplikasi tidak ditemukan.');
        }
        res.send('Aplikasi berhasil diupdate.');
    });
});

// Mengelompokkan rute untuk /api/pics
const picsRouter = express.Router();


// Endpoint untuk menambahkan PIC baru
picsRouter.post('/', (req, res, next) => {
    const { npp, nama, role, jabatan, no_telp, email, entity, grup, rubrik } = req.body;
    if (!npp || !nama) {
        return res.status(400).send('NPP dan nama harus diisi.');
    }
    const query = `
        INSERT INTO pics (npp, nama, role, jabatan, no_telp, email, entity, grup, rubrik)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [npp, nama, role, jabatan, no_telp, email, entity, grup, rubrik];
    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        res.status(201).send('PIC berhasil ditambahkan.');
    });
});

// endpoint PUT untuk mengupdate data PIC
picsRouter.put('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const { nama, role, jabatan, no_telp, email, entity, grup, rubrik } = req.body;
    const query = `
        UPDATE pics
        SET nama = ?, role = ?, jabatan = ?, no_telp = ?, email = ?, entity = ?, grup = ?, rubrik = ?
        WHERE npp = ?
    `;
    const params = [nama, role, jabatan, no_telp, email, entity, grup, rubrik, npp];
    sql.query(connectionString, query, params, (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil diupdate.');
    });
});

// Endpoint untuk menghapus PIC
picsRouter.delete('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "DELETE FROM pics WHERE npp = ?";
    sql.query(connectionString, query, [npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.send('PIC berhasil dihapus.');
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

// Endpoint yang dipertahankan
appsRouter.get('/:id/pics', (req, res, next) => {
    const applicationId = req.params.id;
    const query = `
        SELECT p.*
        FROM pics p
        JOIN app_pic_map apm ON p.npp = apm.npp
        WHERE apm.application_id = ?
    `;
    sql.query(connectionString, query, [applicationId], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

app.use('/api/apps', appsRouter);

// Endpoint untuk mendapatkan semua PIC
picsRouter.get('/', (req, res, next) => {
    const query = "SELECT * FROM pics";
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});


picsRouter.get('/:npp', (req, res, next) => {
    const npp = req.params.npp;
    const query = "SELECT * FROM pics WHERE npp = ?";
    sql.query(connectionString, query, [npp], (err, rows) => {
        if (err) return next(err);
        if (rows.length === 0) {
            return res.status(404).send('PIC tidak ditemukan.');
        }
        res.json(rows[0]);
    });
});

picsRouter.get('/:npp/apps', (req, res, next) => {
    const npp = req.params.npp;
    const query = `
        SELECT a.*
        FROM apps a
        JOIN app_pic_map apm ON a.application_id = apm.application_id
        WHERE apm.npp = ?
    `;
    sql.query(connectionString, query, [npp], (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// Endpoint untuk mendapatkan semua relasi app-pic
app.get('/api/app-pic-map', (req, res, next) => {
    const query = `
        SELECT
            apm.application_id,
            a.nama_aplikasi,
            apm.npp,
            p.nama AS nama_pic,
            apm.note
        FROM app_pic_map apm
        JOIN apps a ON apm.application_id = a.application_id
        JOIN pics p ON apm.npp = p.npp
    `;
    sql.query(connectionString, query, (err, rows) => {
        if (err) return next(err);
        res.json(rows);
    });
});

// Endpoint untuk menghapus relasi app-pic
app.delete('/api/app-pic-map', (req, res, next) => {
    const { application_id, npp } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "DELETE FROM app_pic_map WHERE application_id = ? AND npp = ?";
    sql.query(connectionString, query, [application_id, npp], (err, result) => {
        if (err) return next(err);
        if (result.rowsAffected === 0) {
            return res.status(404).send('Relasi tidak ditemukan.');
        }
        res.send('Relasi berhasil dihapus.');
    });
});

// Endpoint untuk menambahkan relasi pic ke aplikasi
app.post('/api/app-pic-map', (req, res, next) => {
    const { application_id, npp, note } = req.body;
    if (!application_id || !npp) {
        return res.status(400).send('application_id dan npp harus diisi.');
    }

    const query = "INSERT INTO app_pic_map (application_id, npp, note) VALUES (?, ?, ?)";
    sql.query(connectionString, query, [application_id, npp, note], (err, result) => {
        if (err) return next(err);
        res.status(201).send('Relasi berhasil ditambahkan.');
    });
});

app.use('/api/pics', picsRouter);

// Mulai server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});