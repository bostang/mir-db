// be/src/routes/stats.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// Helper untuk mengubah callback menjadi Promise (karena db.js menggunakan callback)
const runQuery = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

router.get('/', async (req, res) => {
    try {
        // Jalankan kueri satu per satu dengan helper Promise
        const appRes = await runQuery("SELECT COUNT(*) as total FROM apps");
        const peopleRes = await runQuery("SELECT COUNT(*) as total FROM people");
        const relationRes = await runQuery("SELECT COUNT(*) as total FROM people_apps_map");

        // msnodesqlv8 biasanya mengembalikan data langsung dalam bentuk array of objects
        res.json({
            apps: appRes[0]?.total || 0,
            people: peopleRes[0]?.total || 0,
            relations: relationRes[0]?.total || 0
        });
    } catch (err) {
        console.error("STATS_ROUTE_ERROR:", err);
        res.status(500).json({ 
            message: "Gagal mengambil statistik", 
            error: err.toString() 
        });
    }
});

module.exports = router;